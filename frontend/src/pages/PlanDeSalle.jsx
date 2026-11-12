import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { listerTables } from "../api/tables";
import CarteTable from "../components/CarteTable";
import { useMaintenant } from "../lib/temps";
import { localeDates } from "../i18n";

function Compteur({ nombre, libelle, couleur }) {
  const { t } = useTranslation();
  return (
    <span className="text-sm text-charbon/70">
      <b className={`font-titre text-2xl mr-1 ${couleur}`}>{nombre}</b>
      {t(libelle)}
    </span>
  );
}

export default function PlanDeSalle() {
  const { t } = useTranslation();
  const maintenant = useMaintenant();
  const aujourdhui = new Date(maintenant).toLocaleDateString(localeDates(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const { data: tables, isLoading, isError, refetch } = useQuery({
    queryKey: ["tables"],
    queryFn: listerTables,
    refetchInterval: 15000,
  });

  if (isLoading) return <p className="text-charbon/70">{t("Chargement du plan de salle…")}</p>;

  if (isError)
    return (
      <div>
        <p className="text-red-700 mb-3">{t("Impossible de charger les tables.")}</p>
        <button
          onClick={() => refetch()}
          className="border border-charbon/30 rounded-md px-3 py-1.5 text-sm"
        >
          {t("Réessayer")}
        </button>
      </div>
    );

  const libres = tables.filter((t) => t.statut === "libre").length;
  const occupees = tables.filter((t) => t.statut === "occupee").length;
  const additions = tables.filter((t) => t.statut === "addition_demandee").length;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-2">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-charbon/60">
            {t("Salle principale")} · {aujourdhui}
          </p>
          <h1 className="font-titre text-4xl font-medium mt-1">{t("Plan de salle")}</h1>
        </div>
        <div className="flex flex-wrap items-baseline gap-5">
          <Compteur nombre={libres} libelle={libres > 1 ? "libres" : "libre"} couleur="text-olive" />
          <Compteur
            nombre={occupees}
            libelle={occupees > 1 ? "occupées" : "occupée"}
            couleur="text-safran-fonce"
          />
          <Compteur nombre={additions} libelle="addition" couleur="text-brique" />
        </div>
      </div>
      <p className="text-sm text-charbon/70 mb-6">
        {t("Choisissez une table libre pour prendre une commande.")}
      </p>

      {tables.length === 0 ? (
        <p className="text-charbon/70">{t("Aucune table pour le moment.")}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <CarteTable key={table.id} table={table} maintenant={maintenant} />
          ))}
        </div>
      )}
    </section>
  );
}
