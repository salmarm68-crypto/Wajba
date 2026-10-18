<?php

namespace App\Http\Controllers;

use App\Enums\ModePaiement;
use App\Enums\StatutCommande;
use App\Enums\StatutTable;
use App\Http\Resources\CommandeResource;
use App\Models\Commande;
use App\Models\Menu;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class CommandeController extends Controller
{
    /** Relations chargées avec chaque commande. */
    private const RELATIONS = ['table', 'serveur', 'menus'];

    /**
     * Liste des commandes.
     * Filtres : ?statut=en_cours (commandes ouvertes) ou un statut précis,
     * ?table_id=, ?date=AAAA-MM-JJ.
     */
    public function index(Request $request)
    {
        $requete = Commande::with(self::RELATIONS)->latest('id');

        if ($request->filled('statut')) {
            $statut = $request->query('statut');
            if ($statut === 'en_cours') {
                $requete->whereIn('statut', StatutCommande::ouvertes());
            } else {
                $requete->where('statut', $statut);
            }
        }
        if ($request->filled('table_id')) {
            $requete->where('table_id', $request->query('table_id'));
        }
        if ($request->filled('date')) {
            $requete->whereDate('created_at', $request->query('date'));
        }

        return CommandeResource::collection($requete->limit(200)->get());
    }

    public function show(Commande $commande): CommandeResource
    {
        return new CommandeResource($commande->load(self::RELATIONS));
    }

    /** Création : plats disponibles et table libre, puis table occupée (transaction). */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validerLignes($request, true);

        $table = Table::findOrFail($data['table_id']);

        $tableOccupee = $table->statut !== StatutTable::Libre
            || Commande::where('table_id', $table->id)->whereIn('statut', StatutCommande::ouvertes())->exists();

        if ($tableOccupee) {
            throw ValidationException::withMessages([
                'table_id' => ['Cette table est déjà occupée.'],
            ]);
        }

        $menus = $this->menusDemandes($data['lignes']);
        $this->verifierDisponibilite($data['lignes'], $menus);

        $commande = DB::transaction(function () use ($request, $table, $data, $menus) {
            $commande = Commande::create([
                'table_id' => $table->id,
                'serveur_id' => $request->user()->id,
                'statut' => StatutCommande::EnAttente,
            ]);

            foreach ($data['lignes'] as $ligne) {
                $commande->menus()->attach($ligne['menu_id'], [
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $menus[$ligne['menu_id']]->prix, // prix figé
                    'note' => $ligne['note'] ?? null,
                ]);
            }

            $commande->calculerAddition();
            $table->update(['statut' => StatutTable::Occupee]);

            return $commande;
        });

        return (new CommandeResource($commande->load(self::RELATIONS)))
            ->response()
            ->setStatusCode(201);
    }

    /** Modification des lignes d'une commande non payée (les prix déjà figés sont conservés). */
    public function update(Request $request, Commande $commande): CommandeResource
    {
        $this->verifierOuverte($commande);

        $data = $this->validerLignes($request, false);
        $menus = $this->menusDemandes($data['lignes']);
        $existants = $commande->menus()->get()->keyBy('id');

        $nouvelles = array_values(array_filter(
            $data['lignes'],
            fn ($ligne) => ! $existants->has($ligne['menu_id'])
        ));
        $this->verifierDisponibilite($nouvelles, $menus);

        DB::transaction(function () use ($commande, $data, $menus, $existants) {
            $synchro = [];
            foreach ($data['lignes'] as $ligne) {
                $prix = $existants->has($ligne['menu_id'])
                    ? $existants[$ligne['menu_id']]->pivot->prix_unitaire
                    : $menus[$ligne['menu_id']]->prix;

                $synchro[$ligne['menu_id']] = [
                    'quantite' => $ligne['quantite'],
                    'prix_unitaire' => $prix,
                    'note' => $ligne['note'] ?? null,
                ];
            }

            $commande->menus()->sync($synchro);
            $commande->calculerAddition();
        });

        return new CommandeResource($commande->fresh(self::RELATIONS));
    }

    /** Annulation d'une commande non payée : la table est libérée. */
    public function destroy(Commande $commande): CommandeResource
    {
        $this->verifierOuverte($commande);

        DB::transaction(function () use ($commande) {
            $commande->update(['statut' => StatutCommande::Annulee]);
            $commande->table->update(['statut' => StatutTable::Libre]);
        });

        return new CommandeResource($commande->fresh(self::RELATIONS));
    }

    /** Passage au statut suivant : en_attente, en_preparation, prete, servie. */
    public function statut(Request $request, Commande $commande): CommandeResource
    {
        $request->validate([
            'statut' => ['nullable', Rule::enum(StatutCommande::class)],
        ]);

        $this->verifierOuverte($commande);

        $suivant = $commande->statut->suivant();

        if (! $suivant) {
            throw ValidationException::withMessages([
                'statut' => ['La commande est déjà servie : il n\'y a pas de statut suivant.'],
            ]);
        }

        if ($request->filled('statut') && $request->input('statut') !== $suivant->value) {
            throw ValidationException::withMessages([
                'statut' => ['Transition invalide : le statut attendu est « '.$suivant->value.' ».'],
            ]);
        }

        $commande->update(['statut' => $suivant]);

        return new CommandeResource($commande->fresh(self::RELATIONS));
    }

    /** Demande d'addition : calcule les totaux et passe la table à « addition demandée ». */
    public function addition(Commande $commande): CommandeResource
    {
        $this->verifierOuverte($commande);

        DB::transaction(function () use ($commande) {
            $commande->calculerAddition();
            $commande->table->update(['statut' => StatutTable::AdditionDemandee]);
        });

        return new CommandeResource($commande->fresh(self::RELATIONS));
    }

    /** Remise en MAD, jamais supérieure au sous-total. */
    public function remise(Request $request, Commande $commande): CommandeResource
    {
        $this->verifierOuverte($commande);

        $commande->calculerAddition();

        $data = $request->validate([
            'remise' => ['required', 'numeric', 'min:0', 'max:'.$commande->sous_total],
        ]);

        $commande->remise = $data['remise'];
        $commande->calculerAddition();

        return new CommandeResource($commande->fresh(self::RELATIONS));
    }

    /** Paiement : commande payée et clôturée, table libérée. */
    public function paiement(Request $request, Commande $commande): CommandeResource
    {
        $this->verifierOuverte($commande);

        $data = $request->validate([
            'mode_paiement' => ['required', Rule::enum(ModePaiement::class)],
        ]);

        DB::transaction(function () use ($commande, $data) {
            $commande->calculerAddition();
            $commande->update([
                'statut' => StatutCommande::Payee,
                'mode_paiement' => $data['mode_paiement'],
                'paye_le' => now(),
            ]);
            $commande->table->update(['statut' => StatutTable::Libre]);
        });

        return new CommandeResource($commande->fresh(self::RELATIONS));
    }

    /** Une commande payée ou annulée ne peut plus être modifiée. */
    private function verifierOuverte(Commande $commande): void
    {
        if (! $commande->estOuverte()) {
            throw ValidationException::withMessages([
                'commande' => ['Cette commande est déjà payée ou annulée : elle ne peut plus être modifiée.'],
            ]);
        }
    }

    private function validerLignes(Request $request, bool $avecTable): array
    {
        $regles = [
            'lignes' => ['required', 'array', 'min:1'],
            'lignes.*.menu_id' => [
                'required', 'integer', 'distinct',
                Rule::exists('menus', 'id')->whereNull('deleted_at'),
            ],
            'lignes.*.quantite' => ['required', 'integer', 'min:1', 'max:50'],
            'lignes.*.note' => ['nullable', 'string', 'max:255'],
        ];

        if ($avecTable) {
            $regles['table_id'] = [
                'required', 'integer',
                Rule::exists('tables', 'id')->whereNull('deleted_at'),
            ];
        }

        return $request->validate($regles);
    }

    /** Plats demandés, indexés par identifiant. */
    private function menusDemandes(array $lignes)
    {
        return Menu::whereIn('id', collect($lignes)->pluck('menu_id'))->get()->keyBy('id');
    }

    /** Un plat indisponible ne peut pas être commandé. */
    private function verifierDisponibilite(array $lignes, $menus): void
    {
        foreach ($lignes as $index => $ligne) {
            $menu = $menus[$ligne['menu_id']];
            if (! $menu->disponible) {
                throw ValidationException::withMessages([
                    "lignes.$index.menu_id" => ['Le plat « '.$menu->nom.' » est indisponible.'],
                ]);
            }
        }
    }
}
