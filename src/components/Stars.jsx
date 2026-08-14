export default function Stars({ rating = 0, size = "sm" }) {
  const cls = size === "sm" ? "text-sm" : "text-base";
  return (
    <span className={`${cls} tracking-tight`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "text-amber-400" : "text-slate-200"}>
          ★
        </span>
      ))}
    </span>
  );
}
