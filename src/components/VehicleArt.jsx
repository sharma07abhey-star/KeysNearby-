import { useId } from "react";

// Simple side-view silhouettes, used when a vehicle has no photo.
const COLORS = {
  blue: ["#60a5fa", "#1d4ed8"],
  violet: ["#a78bfa", "#6d28d9"],
  cyan: ["#22d3ee", "#0e7490"],
  orange: ["#fb923c", "#c2410c"],
};

const BODIES = {
  Sedan: {
    body: "M26 112 L38 92 Q48 87 88 83 L122 62 Q132 56 148 56 L206 56 Q222 56 232 68 L250 84 Q286 88 294 100 L298 112 Z",
    glass: "M104 82 L128 64 Q134 61 146 61 L172 61 L172 82 Z M180 61 L206 61 Q216 61 222 70 L232 82 L180 82 Z",
  },
  SUV: {
    body: "M24 112 L24 78 Q26 70 52 68 L84 44 Q90 40 100 40 L246 40 Q256 40 260 50 L266 70 Q292 74 298 90 L298 112 Z",
    glass: "M92 66 L106 48 L156 48 L156 66 Z M164 48 L238 48 L246 66 L164 66 Z",
  },
  Hatchback: {
    body: "M30 112 L38 90 Q46 85 80 81 L112 56 Q120 50 134 50 L196 50 Q212 50 220 62 L238 84 Q276 88 290 100 L294 112 Z",
    glass: "M98 78 L122 58 L160 58 L160 78 Z M168 58 L196 58 Q206 58 212 66 L224 78 L168 78 Z",
  },
  MPV: {
    body: "M22 112 L28 82 Q32 72 56 70 L88 46 Q94 42 104 42 L248 42 Q260 42 266 54 L276 74 Q294 80 298 92 L300 112 Z",
    glass: "M92 70 L106 50 L150 50 L150 70 Z M158 50 L204 50 L204 70 L158 70 Z M212 50 L250 50 L262 70 L212 70 Z",
  },
};

function Wheel({ cx, cy, r }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#05080f" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#2a3550" />
      <circle cx={cx} cy={cy} r={r * 0.18} fill="#8fa0c4" />
    </g>
  );
}

export default function VehicleArt({ type = "Sedan", color = "blue" }) {
  const id = useId();
  const [light, dark] = COLORS[color] || COLORS.blue;
  const isTwoWheeler = type === "Bike" || type === "Scooter";

  return (
    <svg className="vehicle-silhouette" viewBox="0 0 320 150" role="img" aria-label={`${type} illustration`}>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="138" rx="130" ry="7" fill="#000" opacity=".35" />
      {isTwoWheeler ? (
        <g fill="none" stroke={`url(#${id}-g)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          {type === "Bike" ? (
            <>
              <path d="M82 112 L128 80 L196 80 L236 112" />
              <path d="M128 80 L112 64 L150 62" strokeWidth="9" />
              <path d="M196 80 L212 52 L236 52 M212 52 L236 112" />
              <path d="M96 70 L140 70" strokeWidth="10" />
            </>
          ) : (
            <>
              <path d="M62 112 Q66 84 112 86 L176 86 L196 56 L214 46 L236 46" />
              <path d="M212 46 L238 112" />
              <path d="M84 78 L150 78" strokeWidth="10" />
            </>
          )}
        </g>
      ) : (
        <g>
          <path d={(BODIES[type] || BODIES.Sedan).body} fill={`url(#${id}-g)`} />
          <path d={(BODIES[type] || BODIES.Sedan).glass} fill="#0b1426" opacity=".72" />
        </g>
      )}
      <Wheel cx={isTwoWheeler ? 82 : 92} cy={112} r={isTwoWheeler ? 24 : 20} />
      <Wheel cx={isTwoWheeler ? 238 : 232} cy={112} r={isTwoWheeler ? 24 : 20} />
    </svg>
  );
}
