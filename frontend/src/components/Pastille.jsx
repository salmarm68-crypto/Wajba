const TONS = {
  vert: "bg-olive/10 text-olive",
  ambre: "bg-safran/15 text-safran-fonce",
  rouge: "bg-brique/10 text-brique",
  neutre: "bg-charbon/10 text-charbon/70",
};

// Étiquette arrondie (statuts, rôles, disponibilité).
export default function Pastille({ ton = "neutre", children }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${TONS[ton]}`}
    >
      {children}
    </span>
  );
}
