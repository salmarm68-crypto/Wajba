import { useTranslation } from "react-i18next";

const TONS = {
  vert: "bg-olive/10 text-olive",
  ambre: "bg-safran/15 text-safran-fonce",
  rouge: "bg-brique/10 text-brique",
  neutre: "bg-charbon/10 text-charbon/70",
};

// Étiquette arrondie (statuts, rôles, disponibilité).
export default function Pastille({ ton = "neutre", children }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${TONS[ton]}`}
    >
      {typeof children === "string" ? t(children) : children}
    </span>
  );
}
