// Logo Wajba : anneau safran avec un W, suivi du nom.
export default function Logo({ grand = false }) {
  const taille = grand ? 44 : 32;
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={taille} height={taille} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke="#D9A441" strokeWidth="1.5" />
        <path
          d="M8 10l4 12 4-9 4 9 4-12"
          stroke="#D9A441"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`font-titre font-bold ${grand ? "text-4xl" : "text-2xl"}`}>Wajba</span>
    </span>
  );
}
