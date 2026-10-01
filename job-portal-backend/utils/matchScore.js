// Returns a 0-100 score based on overlap between candidate skills and job's required skills,
// with a small bonus/penalty for experience fit. Intentionally simple and easy to swap out later.
export function calculateMatchScore(candidateSkills = [], job) {
  const requiredSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());
  const candidateSet = new Set(candidateSkills.map((s) => s.toLowerCase()));

  if (requiredSkills.length === 0) return 50; // neutral score if job lists no required skills

  const matched = requiredSkills.filter((skill) => candidateSet.has(skill));
  const skillScore = (matched.length / requiredSkills.length) * 100;

  return Math.round(Math.min(100, Math.max(0, skillScore)));
}
