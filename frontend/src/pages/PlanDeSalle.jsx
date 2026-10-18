import { useQuery } from "@tanstack/react-query";
import { listerTables } from "../api/tables";
import CarteTable from "../components/CarteTable";

export default function PlanDeSalle() {
  const { data: tables, isLoading, isError, refetch } = useQuery({
    queryKey: ["tables"],
    queryFn: listerTables,
    refetchInterval: 15000,
  });

  if (isLoading) return <p className="text-charbon/70">Chargement du plan de salle…</p>;

  if (isError)
    return (
      <div>
        <p className="text-red-700 mb-3">Impossible de charger les tables.</p>
        <button
          onClick={() => refetch()}
          className="border border-charbon/30 rounded-md px-3 py-1.5 text-sm"
        >
          Réessayer
        </button>
      </div>
    );

  const libres = tables.filter((t) => t.statut === "libre").length;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
        <h1 className="font-titre text-3xl font-bold">Plan de salle</h1>
        <p className="text-sm text-charbon/70">
          {libres} libre{libres > 1 ? "s" : ""} sur {tables.length} table
          {tables.length > 1 ? "s" : ""}
        </p>
      </div>

      {tables.length === 0 ? (
        <p className="text-charbon/70">Aucune table pour le moment.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <CarteTable key={table.id} table={table} />
          ))}
        </div>
      )}
    </section>
  );
}
