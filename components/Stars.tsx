/** Voto 1–10 reso con 5 stelle (mezze stelle arrotondate). */
export function Stars({ value, size }: { value: number | null; size?: string }) {
  const stars = value ? Math.round(value / 2) : 0;
  return (
    <span
      className="stelle"
      style={size ? { fontSize: size } : undefined}
      title={value ? `${value.toFixed(1).replace(".", ",")} su 10` : "Nessun voto"}
      aria-label={value ? `${value.toFixed(1)} su 10` : "Nessun voto"}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= stars ? undefined : "spenta"}>
          ★
        </span>
      ))}
    </span>
  );
}
