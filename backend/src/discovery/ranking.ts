import { UserProfile } from '../types';
import { Career } from '../career/models';
import { AssessmentResult } from '../assessment/models';
import { RecommendedCareer } from './models';
import { CareerMatching } from './matching';

export const CareerRanking = {
  /**
   * Evaluates all careers in the catalog and ranks the top 5 recommended careers.
   */
  rankTopCareers(
    profile: UserProfile,
    careers: Career[],
    assessments: AssessmentResult[]
  ): RecommendedCareer[] {
    const list: RecommendedCareer[] = careers.map(career => {
      const matchScore = CareerMatching.calculateMatchScore(profile, career, assessments);

      // Extract missing skills
      const userSkills = (profile.skills || []).map(s => s.toLowerCase().trim());
      const missingSkills = career.requiredSkills.filter(s => 
        !userSkills.includes(s.toLowerCase().trim())
      );

      // Compute estimated time to become job ready in months
      const hoursPerDay = parseInt(profile.timeAvailability?.hoursPerDay || '2');
      const daysPerWeek = parseInt(profile.timeAvailability?.daysPerWeek || '5');
      const weeklyHours = hoursPerDay * daysPerWeek || 10;
      
      const hoursPerSkill = career.difficulty === 'Beginner' ? 30 : career.difficulty === 'Intermediate' ? 50 : 80;
      const totalHoursNeeded = missingSkills.length * hoursPerSkill;
      const weeksNeeded = totalHoursNeeded / weeklyHours;
      const estimatedTimeToReadyMonths = Math.max(1, Math.round(weeksNeeded / 4.3));

      // Compose programmatic description of why it matches
      let whyItMatches = 'Fits your career preferences and available schedule.';
      if (matchScore.skillMatch >= 80) {
        whyItMatches = `Strong alignment with your technical skills, matching ${career.requiredSkills.length - missingSkills.length} out of ${career.requiredSkills.length} required skills.`;
      } else if (matchScore.interestMatch >= 80) {
        whyItMatches = `Complements your expressed interests in ${career.category}.`;
      } else if (matchScore.educationMatch >= 90) {
        whyItMatches = `Aligns perfectly with your academic background in ${profile.education?.degree || 'Computer Science'}.`;
      }

      return {
        careerId: career.id,
        careerName: career.title,
        matchScore,
        shortDescription: career.shortDescription,
        whyItMatches,
        requiredSkills: career.requiredSkills,
        missingSkills,
        estimatedSalary: career.salaryRange,
        growthTrend: career.growthTrend,
        difficulty: career.difficulty,
        estimatedTimeToReadyMonths
      };
    });

    // Sort descending by overallMatch score, take top 20
    return list
      .sort((a, b) => b.matchScore.overallMatch - a.matchScore.overallMatch)
      .slice(0, 20);
  }
};
export default CareerRanking;
