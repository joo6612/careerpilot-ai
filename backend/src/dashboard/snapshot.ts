import { CareerSnapshot } from './models';
import { AggregatedData } from './aggregator';

export class SnapshotCalculator {
  static calculate(aggregated: AggregatedData): CareerSnapshot {
    const {
      profile,
      latestDiscovery,
      discoveryHistory,
      assessmentAttempts,
      latestResume,
      latestReadiness,
      activeRoadmap,
      vaultDocuments,
      conversations
    } = aggregated;

    // 1. Current Career
    const currentCareer = profile?.selectedCareer || latestReadiness?.metadata?.careerTitle || 'Not Selected';

    // 2. Career Match %
    let careerMatchPercentage = 75; // Default if not found
    if (currentCareer && currentCareer !== 'Not Selected') {
      const recommendations = latestDiscovery?.recommendations || 
        discoveryHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.recommendations || [];
      
      const matchedRec = recommendations.find(r => 
        r.careerName.toLowerCase().trim() === currentCareer.toLowerCase().trim() ||
        r.careerId.toLowerCase().trim() === currentCareer.toLowerCase().trim()
      );
      if (matchedRec) {
        careerMatchPercentage = matchedRec.matchScore.overallMatch;
      } else if (latestReadiness?.overallReadiness) {
        careerMatchPercentage = Math.max(70, latestReadiness.overallReadiness);
      }
    }

    // 3. Career Readiness
    const careerReadiness = latestReadiness?.overallReadiness || 0;

    // 4. Resume ATS Score
    const resumeAtsScore = latestResume?.atsAnalysis?.atsScore || profile?.resume?.atsScore || 0;

    // 5. Verified Skills
    const verifiedSkills = Array.from(new Set(
      assessmentAttempts
        .filter(attempt => attempt.percentage >= 70)
        .map(attempt => attempt.skill)
    ));

    // 6. Completed Assessments
    const completedAssessments = assessmentAttempts.length;

    // 7. Roadmap Progress
    const roadmapProgress = activeRoadmap?.completionPercentage || 0;

    // 8. Certificates Count
    const profileCertsCount = profile?.certifications?.length || 0;
    const vaultCertsCount = vaultDocuments.filter(doc => doc.category === 'Certificate' && doc.status === 'active').length;
    const certificatesCount = profileCertsCount + vaultCertsCount;

    // 9. Projects Count
    const hasProfileProjects = (profile?.projects?.githubUrl || profile?.projects?.description) ? 1 : 0;
    const vaultProjectsCount = vaultDocuments.filter(doc => doc.category === 'Project' && doc.status === 'active').length;
    const projectsCount = hasProfileProjects + vaultProjectsCount;

    // 10. Documents Count
    const documentsCount = vaultDocuments.filter(doc => doc.status === 'active').length;

    // 11. Current Goal
    let currentGoal = 'Select a Career Path & Generate Roadmap';
    if (currentCareer && currentCareer !== 'Not Selected') {
      if (activeRoadmap) {
        let activeMilestone = null;
        for (const phase of activeRoadmap.phases) {
          const incomplete = phase.milestones.find(m => m.status !== 'completed');
          if (incomplete) {
            activeMilestone = incomplete;
            break;
          }
        }
        if (activeMilestone) {
          currentGoal = `Complete milestone: ${activeMilestone.title}`;
        } else {
          currentGoal = `Achieve Job Readiness for ${currentCareer}`;
        }
      } else {
        currentGoal = `Generate roadmap for ${currentCareer}`;
      }
    }

    // 12. Estimated Time To Become Job Ready
    let estimatedTimeToBecomeJobReady = 'TBD';
    const hoursRemaining = activeRoadmap?.estimatedRemainingTimeHours ?? latestReadiness?.estimatedCompletionTimeHours ?? null;
    if (hoursRemaining !== null && hoursRemaining > 0) {
      const hoursPerDay = parseInt(profile?.timeAvailability?.hoursPerDay || '2') || 2;
      const daysPerWeek = parseInt(profile?.timeAvailability?.daysPerWeek || '5') || 5;
      const hoursPerWeek = hoursPerDay * daysPerWeek || 10;
      
      const weeks = Math.ceil(hoursRemaining / hoursPerWeek);
      if (weeks <= 0) {
        estimatedTimeToBecomeJobReady = 'Job Ready';
      } else if (weeks === 1) {
        estimatedTimeToBecomeJobReady = `1 week (${hoursRemaining} hours)`;
      } else {
        estimatedTimeToBecomeJobReady = `${weeks} weeks (${hoursRemaining} hours)`;
      }
    } else if (careerReadiness >= 80) {
      estimatedTimeToBecomeJobReady = 'Job Ready';
    }

    // 13. Last Updated
    const dates: Date[] = [];
    if (latestResume) dates.push(new Date(latestResume.timestamp));
    if (assessmentAttempts.length > 0) {
      const latestAttempt = [...assessmentAttempts].sort((a, b) => 
        new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
      )[0];
      dates.push(new Date(latestAttempt.completedDate));
    }
    if (activeRoadmap) dates.push(new Date(activeRoadmap.timestamp));
    if (vaultDocuments.length > 0) {
      const latestDoc = [...vaultDocuments].sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      )[0];
      dates.push(new Date(latestDoc.uploadDate));
    }
    if (conversations.length > 0) {
      const latestConv = [...conversations].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      dates.push(new Date(latestConv.updatedAt));
    }

    const validDates = dates.filter(d => d !== null && !isNaN(d.getTime()));
    const lastUpdated = validDates.length > 0
      ? new Date(Math.max(...validDates.map(d => d.getTime()))).toISOString()
      : new Date().toISOString();

    return {
      currentCareer,
      careerMatchPercentage,
      careerReadiness,
      resumeAtsScore,
      verifiedSkills,
      completedAssessments,
      roadmapProgress,
      certificatesCount,
      projectsCount,
      documentsCount,
      currentGoal,
      estimatedTimeToBecomeJobReady,
      lastUpdated
    };
  }
}
