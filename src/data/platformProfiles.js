// Loads the platform dataset. The content itself lives in platformProfiles.json.
//
// platforms[]   Platform names, in the order they appear in the
//               recommendation list and comparison table.
//
// criteria[]    { id, label, category }
//   Comparison criteria. Each is revealed in the comparison matrix once the
//   team has evidence in its `category` (see evidence.json).
//
// profiles      { [platform]: { [criterionId]: score 0–10, higher is better } }
//   cost / manufacturing / future are the original values; the other
//   criteria are provisional and should be reviewed with the module tutor.
import platformData from "./platformProfiles.json" with { type: "json" };

export const platforms = platformData.platforms;

export const criteria = platformData.criteria;

export const platformProfiles = platformData.profiles;
