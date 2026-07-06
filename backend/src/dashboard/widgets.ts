import { DashboardWidget, WidgetType } from './models';
import { AggregatedData } from './aggregator';
import { SnapshotCalculator } from './snapshot';

export class WidgetsBuilder {
  static buildAll(aggregated: AggregatedData): DashboardWidget[] {
    const widgets: DashboardWidget[] = [];

    // 1. Career Snapshot Widget
    widgets.push({
      id: 'w-career-snapshot',
      type: 'career-snapshot',
      title: 'Career Progress Snapshot',
      gridArea: 'span 4 / span 4',
      data: SnapshotCalculator.calculate(aggregated)
    });

    // 2. Career Readiness Widget
    const readiness = aggregated.latestReadiness;
    widgets.push({
      id: 'w-career-readiness',
      type: 'career-readiness',
      title: 'Readiness Analysis Vector',
      gridArea: 'span 3 / span 3',
      data: {
        overallReadiness: readiness?.overallReadiness || 0,
        status: readiness?.status || 'Not Ready',
        categoryScores: readiness?.categoryScores || {
          skillReadiness: 0,
          resumeReadiness: 0,
          projectReadiness: 0,
          certificationReadiness: 0,
          educationReadiness: 0,
          assessmentReadiness: 0,
          learningProgress: 0
        }
      }
    });

    // 3. Resume Summary Widget
    const resume = aggregated.latestResume;
    widgets.push({
      id: 'w-resume-summary',
      type: 'resume-summary',
      title: 'ATS Resume Review',
      gridArea: 'span 3 / span 3',
      data: {
        atsScore: resume?.atsAnalysis?.atsScore || aggregated.profile?.resume?.atsScore || 0,
        fileName: resume?.fileName || aggregated.profile?.resume?.fileName || 'No Resume Uploaded',
        timestamp: resume?.timestamp || null,
        formattingScore: resume?.atsAnalysis?.formattingScore || 0,
        keywordScore: resume?.atsAnalysis?.keywordScore || 0,
        skillsScore: resume?.atsAnalysis?.skillsScore || 0,
        experienceScore: resume?.atsAnalysis?.experienceScore || 0,
        educationScore: resume?.atsAnalysis?.educationScore || 0,
        projectsScore: resume?.atsAnalysis?.projectsScore || 0,
        strengths: resume?.improvementReport?.strengths || aggregated.profile?.resume?.strengths || [],
        weaknesses: resume?.improvementReport?.weaknesses || aggregated.profile?.resume?.weaknesses || [],
        missingKeywords: resume?.improvementReport?.missingKeywords || aggregated.profile?.resume?.missingSkills || [],
        actionableSuggestions: resume?.improvementReport?.actionableSuggestions || []
      }
    });

    // 4. Roadmap Progress Widget
    const roadmap = aggregated.activeRoadmap;
    widgets.push({
      id: 'w-roadmap-progress',
      type: 'roadmap-progress',
      title: 'Roadmap Completion Stages',
      gridArea: 'span 4 / span 4',
      data: {
        completionPercentage: roadmap?.completionPercentage || 0,
        estimatedRemainingTimeHours: roadmap?.estimatedRemainingTimeHours || 0,
        careerTitle: roadmap?.careerTitle || 'No Career Selection',
        phasesCount: roadmap?.phases?.length || 0,
        milestones: roadmap?.phases?.flatMap(p => p.milestones).map(m => ({
          id: m.id,
          title: m.title,
          type: m.type,
          status: m.status,
          tasksCount: m.tasks.length,
          completedTasksCount: m.tasks.filter(t => t.status === 'completed').length
        })) || []
      }
    });

    // 5. Today's Tasks Widget
    const tasks: any[] = [];
    if (roadmap) {
      for (const phase of roadmap.phases) {
        for (const milestone of phase.milestones) {
          if (milestone.status !== 'completed') {
            const incompleteTasks = milestone.tasks.filter(t => t.status !== 'completed');
            tasks.push(...incompleteTasks.map(t => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
              difficulty: t.difficulty,
              estimatedHours: t.estimatedHours,
              status: t.status,
              milestoneTitle: milestone.title
            })));
          }
        }
      }
    }
    widgets.push({
      id: 'w-todays-tasks',
      type: 'todays-tasks',
      title: "Today's Action Focus",
      gridArea: 'span 3 / span 3',
      data: tasks.slice(0, 5)
    });

    // 6. AI Recommendations Widget
    const aiRecs = readiness?.recommendations?.map(r => ({
      id: r.id,
      action: r.action,
      reason: r.reason,
      priority: r.priority,
      estimatedTimeHours: r.estimatedTimeHours,
      difficulty: r.difficulty,
      expectedImpact: r.expectedImpact
    })) || [
      {
        id: 'rec-default-1',
        action: 'Upload a Resume text draft',
        reason: 'No resume is uploaded yet to check ATS scores.',
        priority: 'High',
        estimatedTimeHours: 1,
        difficulty: 'Beginner',
        expectedImpact: 'Critical'
      },
      {
        id: 'rec-default-2',
        action: 'Run a Skill Challenge',
        reason: 'Verify your technical skills through assessments.',
        priority: 'Medium',
        estimatedTimeHours: 2,
        difficulty: 'Intermediate',
        expectedImpact: 'High'
      }
    ];
    widgets.push({
      id: 'w-ai-recommendations',
      type: 'ai-recommendations',
      title: 'AI Priority Recommendations',
      gridArea: 'span 3 / span 3',
      data: aiRecs
    });

    // 7. Recent Activity Widget
    widgets.push({
      id: 'w-recent-activity',
      type: 'recent-activity',
      title: 'Recent Activity Feed',
      gridArea: 'span 3 / span 3',
      data: this.buildRecentActivities(aggregated).slice(0, 5)
    });

    // 8. Career Vault Summary Widget
    const docs = aggregated.vaultDocuments;
    const docsByCategory: Record<string, number> = {};
    docs.forEach(d => {
      if (d.status === 'active') {
        docsByCategory[d.category] = (docsByCategory[d.category] || 0) + 1;
      }
    });
    const totalActiveDocs = docs.filter(d => d.status === 'active').length;
    const unverifiedDocs = docs.filter(d => d.status === 'active' && d.health.verificationStatus === 'unverified').length;
    const verifiedDocs = docs.filter(d => d.status === 'active' && d.health.verificationStatus === 'verified').length;
    widgets.push({
      id: 'w-vault-summary',
      type: 'career-vault-summary',
      title: 'Career Vault Assets',
      gridArea: 'span 2 / span 2',
      data: {
        totalDocuments: totalActiveDocs,
        documentsByCategory: docsByCategory,
        verificationStatus: {
          verified: verifiedDocs,
          unverified: unverifiedDocs,
          pending: totalActiveDocs - verifiedDocs - unverifiedDocs
        },
        recentUploads: docs
          .filter(d => d.status === 'active')
          .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
          .slice(0, 3)
          .map(d => ({
            id: d.id,
            title: d.title,
            category: d.category,
            uploadDate: d.uploadDate
          }))
      }
    });

    // 9. Assessment Summary Widget
    const attempts = aggregated.assessmentAttempts;
    const uniqueSkills = Array.from(new Set(attempts.map(a => a.skill)));
    const passedAssessments = attempts.filter(a => a.percentage >= 70);
    const averageScore = attempts.length > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0;
    const highestScore = attempts.length > 0
      ? Math.max(...attempts.map(a => a.percentage))
      : 0;
    widgets.push({
      id: 'w-assessment-summary',
      type: 'assessment-summary',
      title: 'Skill Assessment Reports',
      gridArea: 'span 3 / span 3',
      data: {
        totalAttempts: attempts.length,
        completedSkillsCount: uniqueSkills.length,
        passedSkillsCount: passedAssessments.length,
        averageScore,
        highestScore,
        recentAttempts: attempts
          .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime())
          .slice(0, 5)
          .map(a => ({
            sessionId: a.sessionId,
            skill: a.skill,
            percentage: a.percentage,
            difficulty: a.difficulty,
            completedDate: a.completedDate,
            verifiedScore: a.verifiedScore
          }))
      }
    });

    // 10. Learning Progress Widget
    let totalRoadmapTasks = 0;
    let completedRoadmapTasks = 0;
    let totalRoadmapMilestones = 0;
    let completedRoadmapMilestones = 0;
    if (roadmap) {
      roadmap.phases.forEach(p => {
        p.milestones.forEach(m => {
          totalRoadmapMilestones++;
          if (m.status === 'completed') completedRoadmapMilestones++;
          m.tasks.forEach(t => {
            totalRoadmapTasks++;
            if (t.status === 'completed') completedRoadmapTasks++;
          });
        });
      });
    }
    widgets.push({
      id: 'w-learning-progress',
      type: 'learning-progress',
      title: 'Learning Completion Progress',
      gridArea: 'span 2 / span 2',
      data: {
        completionPercentage: roadmap?.completionPercentage || 0,
        totalTasks: totalRoadmapTasks,
        completedTasks: completedRoadmapTasks,
        totalMilestones: totalRoadmapMilestones,
        completedMilestones: completedRoadmapMilestones,
        estimatedRemainingTimeHours: roadmap?.estimatedRemainingTimeHours || 0
      }
    });

    return widgets;
  }

  static buildRecentActivities(aggregated: AggregatedData): any[] {
    const activities: any[] = [];

    // 1. Profile Updated activity (simulated from profile details presence)
    if (aggregated.profile) {
      activities.push({
        id: 'act-prof-init',
        type: 'Profile Updated',
        title: 'Profile Updated',
        description: `Your profile bio and metadata were synchronized.`,
        // Default to a timestamp slightly older than the latest database entry
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString() // 24 hours ago
      });
    }

    // 2. Resume Uploaded activities
    aggregated.resumeHistory.forEach((res, index) => {
      activities.push({
        id: `act-res-${res.id}`,
        type: 'Resume Uploaded',
        title: 'Resume Uploaded',
        description: `Uploaded resume version: "${res.fileName}"${res.atsAnalysis ? ` with ATS score ${res.atsAnalysis.atsScore}%` : ''}.`,
        timestamp: res.timestamp,
        meta: { filename: res.fileName, score: res.atsAnalysis?.atsScore }
      });
    });

    // 3. Assessment Completed activities
    aggregated.assessmentAttempts.forEach(attempt => {
      activities.push({
        id: `act-assess-${attempt.sessionId}`,
        type: 'Assessment Completed',
        title: 'Assessment Completed',
        description: `Completed assessment in "${attempt.skill}" (Score: ${attempt.percentage}% - ${attempt.verifiedScore} points).`,
        timestamp: attempt.completedDate,
        meta: { skill: attempt.skill, score: attempt.percentage, verified: attempt.percentage >= 70 }
      });
    });

    // 4. Certificate Uploaded activities
    aggregated.vaultDocuments
      .filter(doc => doc.category === 'Certificate' && doc.status === 'active')
      .forEach(doc => {
        activities.push({
          id: `act-cert-${doc.id}`,
          type: 'Certificate Uploaded',
          title: 'Certificate Uploaded',
          description: `Uploaded professional certificate: "${doc.title}" from provider/file.`,
          timestamp: doc.uploadDate,
          meta: { title: doc.title, category: doc.category }
        });
      });

    // 5. Roadmap Generated activities
    aggregated.roadmapHistory.forEach(item => {
      activities.push({
        id: `act-road-${item.id}`,
        type: 'Roadmap Generated',
        title: 'Roadmap Generated',
        description: `Custom roadmap generated for career track: "${item.roadmap.careerTitle}".`,
        timestamp: item.timestamp,
        meta: { careerTitle: item.roadmap.careerTitle }
      });
    });

    // 6. Career Changed activities (derived from readiness history changes)
    const sortedReadiness = [...aggregated.readinessHistory].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    for (let i = 1; i < sortedReadiness.length; i++) {
      const prev = sortedReadiness[i - 1].report.metadata?.careerTitle;
      const curr = sortedReadiness[i].report.metadata?.careerTitle;
      if (prev && curr && prev !== curr) {
        activities.push({
          id: `act-career-change-${sortedReadiness[i].id}`,
          type: 'Career Changed',
          title: 'Career Track Changed',
          description: `Changed target career focus from "${prev}" to "${curr}".`,
          timestamp: sortedReadiness[i].timestamp,
          meta: { from: prev, to: curr }
        });
      }
    }

    // 7. Mentor Conversation activities
    aggregated.conversations.forEach(conv => {
      activities.push({
        id: `act-mentor-${conv.id}`,
        type: 'Mentor Conversation',
        title: 'Mentor Conversation',
        description: `Engaged with "${conv.personaId.replace(/-/g, ' ')}" AI Mentor (${conv.messages.length} messages).`,
        timestamp: conv.updatedAt || conv.createdAt,
        meta: { persona: conv.personaId, messagesCount: conv.messages.length }
      });
    });

    // Sort by timestamp in descending order (newest first)
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
