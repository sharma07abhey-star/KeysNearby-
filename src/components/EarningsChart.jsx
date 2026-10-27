import { inr } from "../utils/format";

// A tiny hand-made SVG bar chart (no chart library needed).
export default function EarningsChart({ series }) {
  const max = Math.max(...series.map((s) => s.value), 1000);
  const W = 520, H = 190, pad = 28, barW = 44;
  const step = (W - pad * 2) / series.length;

  return (
    <svg className="earnings-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Earnings for the last six months">
      <defs>
        <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad} x2={W - pad} y1={H - 30 - (H - 70) * f} y2={H - 30 - (H - 70) * f} stroke="rgba(148,170,214,.12)" />
      ))}
      {series.map((item, i) => {
        const h = Math.max(4, ((H - 70) * item.value) / max);
        const x = pad + i * step + (step - barW) / 2;
        const y = H - 30 - h;
        const isNow = i === series.length - 1;
        return (
          <g key={item.label}>
            <rect x={x} y={y} width={barW} height={h} rx="8" fill={isNow ? "url(#bar-grad)" : "#1d2b4a"} />
            <text x={x + barW / 2} y={y - 8} textAnchor="middle" className="chart-value">{inr(item.value)}</text>
            <text x={x + barW / 2} y={H - 10} textAnchor="middle" className="chart-label">{item.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
