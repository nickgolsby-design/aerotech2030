import { platformInfo } from "../data/platformInfo.js";

function PlatformCard({ platform, compact = false }) {
  const info = platformInfo[platform];
  return (
    <article className={`card platform-card${compact ? " compact" : ""}`}>
      <h4>{platform}</h4>
      <p className="muted">{info.vendor}</p>
      <p>{info.summary}</p>
      <div className="pros-cons">
        <div>
          <h5>Strengths</h5>
          <ul>
            {info.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5>Concerns</h5>
          <ul>
            {info.concerns.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/** Descriptions of every option, or of one when `only` is given. */
export default function PlatformCards({ platforms, only }) {
  if (only) return <PlatformCard platform={only} compact />;
  return (
    <div className="platform-cards">
      {platforms.map((p) => (
        <PlatformCard key={p} platform={p} />
      ))}
    </div>
  );
}
