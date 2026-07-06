import { ImprovementReport } from './models';

export const ResumeImprovements = {
  /**
   * Generates default structural improvements recommendations.
   */
  generateDefaults(missingSkills: string[]): ImprovementReport {
    return {
      strengths: [
        'Clear layout structure with standard headings.',
        'Core education and contact details are properly listed.'
      ],
      weaknesses: [
        'Lacks quantifiable metrics for previous accomplishments.',
        'Lacks some target technical keywords needed for ATS screening.'
      ],
      missingKeywords: missingSkills,
      missingProjects: [
        'Add a high-impact project demonstrating hands-on expertise with your core skills.'
      ],
      missingCertifications: [
        'Acquire professional certifications in your target tech stack to reinforce competence.'
      ],
      missingTechnologies: missingSkills,
      actionableSuggestions: [
        'Format descriptions using Action Verbs + Metric Metrics (e.g. "Optimized DB queries, reducing latency by 20%")',
        'Integrate missing tool keywords directly inside your technical skills listing.'
      ]
    };
  }
};
export default ResumeImprovements;
