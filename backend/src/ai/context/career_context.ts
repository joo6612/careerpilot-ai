import { Career } from '../../career/models';

/**
 * Generates detailed target career description strings.
 */
export function buildCareerContext(career: Career | null): string {
  if (!career) {
    return 'Target Career Profile: Undefined / No catalog match found.';
  }
  const certs = career.certifications.join(', ') || 'None specified';
  const skills = career.requiredSkills.join(', ');
  
  return `Target Career Title: ${career.title}
Category: ${career.category}
Difficulty Grade: ${career.difficulty}
Core Required Skills: ${skills}
Growth Trend: ${career.growthTrend}
Recommended Certifications: ${certs}`;
}
export default buildCareerContext;
