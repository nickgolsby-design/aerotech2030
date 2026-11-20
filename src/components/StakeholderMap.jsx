import {
  GUARDED_THRESHOLD,
  OPEN_THRESHOLD,
  HIGH_INFLUENCE,
  trustLabel
} from "../data/gameConfig.js";
import { QUADRANTS, quadrantFor } from "../engine/trust.js";

// Plot geometry (SVG user units). Influence axis runs 50–100.
const W = 640;
const H = 400;
const PAD = { left: 64, right: 20, top: 24, bottom: 52 };
const MIN_INFLUENCE = 40;
const RADIUS = 15;

const x = (trust) => PAD.left + (trust / 100) * (W - PAD.left - PAD.right);
const y = (influence) =>
  PAD.top +
  ((100 - influence) / (100 - MIN_INFLUENCE)) * (H - PAD.top - PAD.bottom);

/** Spread out stakeholders that would otherwise sit on top of each other. */
function layout(stakeholders, trust) {
  const points = stakeholders.map((s) => ({
    s,
    cx: x(trust[s.id]),
    cy: y(s.influence),
    startX: x(s.initialTrust)
  }));
  for (let i = 0; i < points.length; i++) {
    for (let j = 0; j < i; j++) {
      const a = points[i];
      const b = points[j];
      if (Math.abs(a.cy - b.cy) < 1 && Math.abs(a.cx - b.cx) < RADIUS * 2) {
        a.cx = b.cx + RADIUS * 2 + 2;
      }
    }
  }
  return points;
}

/**
 * Influence–trust grid (a power–interest style stakeholder map). Each point
 * is a stakeholder; a dashed tail shows how far trust has moved from where
 * it started. Points are buttons that open the interview.
 */
export default function StakeholderMap({ stakeholders, trust, selectedId, onSelect }) {
  const points = layout(stakeholders, trust);
  const grouped = Object.keys(QUADRANTS).map((key) => ({
    key,
    ...QUADRANTS[key],
    names: stakeholders
      .filter((s) => quadrantFor(trust[s.id], s.influence) === key)
      .map((s) => s.name)
  }));

  const activate = (event, id) => {
    if (event.type === "click" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(id);
    }
  };

  return (
    <div className="stakeholder-map">
      <div className="map-scroll">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="map-svg"
          role="group"
          aria-label="Influence–trust map of stakeholders"
        >
          {/* Trust bands */}
          <rect className="map-band band-cautious" x={x(0)} y={PAD.top}
            width={x(GUARDED_THRESHOLD) - x(0)} height={H - PAD.top - PAD.bottom} />
          <rect className="map-band band-cautious" x={x(GUARDED_THRESHOLD)} y={PAD.top}
            width={x(OPEN_THRESHOLD) - x(GUARDED_THRESHOLD)} height={H - PAD.top - PAD.bottom} />
          <rect className="map-band band-open" x={x(OPEN_THRESHOLD)} y={PAD.top}
            width={x(100) - x(OPEN_THRESHOLD)} height={H - PAD.top - PAD.bottom} />

          {/* Quadrant dividers */}
          <line className="map-divider" x1={x(0)} x2={x(100)} y1={y(HIGH_INFLUENCE)} y2={y(HIGH_INFLUENCE)} />
          <line className="map-divider" x1={x(OPEN_THRESHOLD)} x2={x(OPEN_THRESHOLD)} y1={PAD.top} y2={H - PAD.bottom} />

          {/* Quadrant labels */}
          <text className="map-quadrant" x={x(2)} y={PAD.top + 16}>{QUADRANTS.keyRisk.label}</text>
          <text className="map-quadrant" x={x(98)} y={PAD.top + 16} textAnchor="end">{QUADRANTS.keyAlly.label}</text>
          <text className="map-quadrant" x={x(2)} y={H - PAD.bottom - 8}>{QUADRANTS.monitor.label}</text>
          <text className="map-quadrant" x={x(98)} y={H - PAD.bottom - 8} textAnchor="end">{QUADRANTS.supporter.label}</text>

          {/* Axes */}
          {[0, GUARDED_THRESHOLD, OPEN_THRESHOLD, 100].map((t) => (
            <text key={t} className="map-tick" x={x(t)} y={H - PAD.bottom + 18} textAnchor="middle">{t}</text>
          ))}
          {[["Low", 50], ["Medium", 70], ["High", 90]].map(([label, i]) => (
            <text key={label} className="map-tick" x={PAD.left - 10} y={y(i) + 4} textAnchor="end">{label}</text>
          ))}
          <text className="map-axis" x={(x(0) + x(100)) / 2} y={H - 10} textAnchor="middle">
            Trust in your team →
          </text>
          <text className="map-axis" transform={`translate(18 ${(PAD.top + H - PAD.bottom) / 2}) rotate(-90)`} textAnchor="middle">
            Influence →
          </text>

          {/* Stakeholders */}
          {points.map(({ s, cx, cy, startX }) => {
            const value = trust[s.id];
            const label = trustLabel(value);
            const moved = Math.abs(startX - cx) > 1;
            return (
              <g
                key={s.id}
                className={`map-point point-${label.toLowerCase()}${selectedId === s.id ? " selected" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`${s.name}: ${s.influenceLevel} influence, ${label}. Open interview.`}
                onClick={(e) => activate(e, s.id)}
                onKeyDown={(e) => activate(e, s.id)}
              >
                {moved && <line className="map-tail" x1={startX} x2={cx} y1={cy} y2={cy} />}
                <circle cx={cx} cy={cy} r={RADIUS} />
                <text x={cx} y={cy + 4} textAnchor="middle">{s.shortName}</text>
                <title>{`${s.name} · ${s.influenceLevel} influence · ${label}`}</title>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="quadrant-list">
        {grouped.map((q) => (
          <li key={q.key}>
            <strong>{q.label}:</strong>{" "}
            {q.names.length ? q.names.join(", ") : <span className="muted">none</span>}
            <span className="muted"> — {q.advice}</span>
          </li>
        ))}
      </ul>
      <p className="muted map-note">
        Dashed tails show how far trust has moved since the engagement began.
        Select a stakeholder to interview them.
      </p>
    </div>
  );
}
