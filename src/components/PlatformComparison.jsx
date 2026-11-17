import { criteria, platformProfiles } from "../data/platformProfiles.js";
import { evidenceById } from "../data/evidence.js";
import { MAX_CRITERION_WEIGHT } from "../data/gameConfig.js";

const weightOptions = Array.from(
  { length: MAX_CRITERION_WEIGHT + 1 },
  (_, i) => i
);

export default function PlatformComparison({
  platforms,
  evidenceIds,
  weights,
  onWeightChange
}) {
  const coveredCategories = new Set(
    evidenceIds.map((id) => evidenceById[id].category)
  );
  const revealed = criteria.filter((c) => coveredCategories.has(c.category));
  const totalWeight = revealed.reduce((sum, c) => sum + weights[c.id], 0);

  const weightedScore = (platform) => {
    if (totalWeight === 0) return null;
    const sum = revealed.reduce(
      (acc, c) => acc + weights[c.id] * platformProfiles[platform][c.id],
      0
    );
    return (sum / totalWeight).toFixed(1);
  };

  return (
    <section className="panel" id="comparison">
      <hr />

      <h2>Platform Comparison</h2>
      <p className="muted">
        {revealed.length} of {criteria.length} criteria assessed. Scores
        appear once you have evidence in that area. Set weights (0–
        {MAX_CRITERION_WEIGHT}) to reflect AeroTech's priorities.
      </p>

      <div className="table-scroll">
        <table className="comparison">
          <thead>
            <tr>
              <th scope="col">Criterion</th>
              <th scope="col">Weight</th>
              {platforms.map((platform) => (
                <th scope="col" key={platform}>
                  {platform}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion) => {
              const isRevealed = coveredCategories.has(criterion.category);
              return (
                <tr key={criterion.id} className={isRevealed ? "" : "unknown"}>
                  <th scope="row">{criterion.label}</th>
                  <td>
                    <select
                      aria-label={`Weight for ${criterion.label}`}
                      value={weights[criterion.id]}
                      onChange={(event) =>
                        onWeightChange(criterion.id, Number(event.target.value))
                      }
                    >
                      {weightOptions.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </td>
                  {platforms.map((platform) => (
                    <td key={platform}>
                      {isRevealed
                        ? platformProfiles[platform][criterion.id]
                        : "?"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={2}>
                Weighted score (assessed criteria, /10)
              </th>
              {platforms.map((platform) => (
                <td key={platform}>
                  <strong>{weightedScore(platform) ?? "—"}</strong>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
