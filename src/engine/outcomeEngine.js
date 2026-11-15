export function calculateBoardScore(
  evidence,
  consultedStakeholders,
  risk,
  mitigation
) {
  let score = 40;

  evidence.forEach((item) => {
    score += item.weight;
  });

  score += consultedStakeholders.length * 2;

  if (risk.length > 20) {
    score += 10;
  }

  if (mitigation.length > 20) {
    score += 10;
  }

  return Math.min(score, 100);
}
