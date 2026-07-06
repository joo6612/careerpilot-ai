import { UserProfile } from '../types';
import { ResumeRepository } from './repository';
import { CareerRepository } from '../career/repository';
import { AssessmentResult } from '../assessment/models';
import { ResumeVersion, ResumeComparison, ATSAnalysis, SkillGapAnalysis, ImprovementReport } from './models';
import { ATSScoring } from './ats';
import { ResumeSkillGap } from './skill_gap';
import { ResumeImprovements } from './improvements';
import { AIService } from '../ai/services/ai_service';
import { VersionNotFoundError } from './exceptions';
import { CareerNotFoundError } from '../career/exceptions';
import { DbService } from '../services/db';
import { createHash } from 'crypto';

export class ResumeService {
  constructor(
    private repository: ResumeRepository,
    private careerRepository: CareerRepository
  ) {}

  private computeAnalysisHash(textContent: string, careerId: string, skills: string[]): string {
    const dataToHash = {
      textContent,
      careerId,
      skills: [...skills].sort()
    };
    return createHash('sha256').update(JSON.stringify(dataToHash)).digest('hex');
  }

  /**
   * Uploads and saves a new resume version draft.
   */
  async uploadResume(
    uid: string,
    textContent: string,
    fileName: string
  ): Promise<ResumeVersion> {
    const version: ResumeVersion = {
      id: `res-${Date.now()}`,
      uid,
      timestamp: new Date().toISOString(),
      fileName,
      textContent,
      atsAnalysis: null,
      skillGapAnalysis: null,
      improvementReport: null
    };

    await this.repository.save(version);
    return version;
  }

  /**
   * Performs granular ATS grading, skill gaps calculations, AI checks,
   * saves updates, and synchronizes profile resume states.
   */
  async analyzeLatestResume(
    uid: string,
    profile: UserProfile,
    assessments: AssessmentResult[],
    method?: string,
    fileName?: string
  ): Promise<ResumeVersion> {
    let latest = await this.repository.getLatest(uid);
    if (!latest || method === 'generate') {
      const name = fileName || (method === 'generate' ? 'Generated_Profile_Resume.pdf' : 'Uploaded_Resume.pdf');
      const text = `
Resume of ${profile.name || 'Alex Pioneer'}
Email: ${profile.email || 'alex.pioneer@example.com'}
Education:
- Degree: ${profile.education?.degree || 'Computer Science'}
- Institution: ${profile.education?.collegeName || 'Stanford University'}
- Graduation Year: ${profile.education?.graduationYear || '2026'}

Skills:
${(profile.skills || []).join(', ') || 'Python, Git, Software Engineering'}

Interests & Domain Focus:
${(profile.interests || []).join(', ') || 'Software Development, AI, Cloud Engineering'}
      `.trim();
      latest = await this.uploadResume(uid, text, name);
    }

    const careerId = profile.selectedCareer;
    if (!careerId) {
      throw new Error('Target career path not selected on your profile.');
    }

    const currentHash = this.computeAnalysisHash(latest.textContent, careerId, profile.skills || []);
    if (latest.atsAnalysis && (latest as any).analysisHash === currentHash) {
      console.log('[ResumeService] Resume analysis inputs unchanged. Skipping AI resume analysis.');
      return latest;
    }

    let career = await this.careerRepository.getById(careerId);
    if (!career) {
      const normalized = careerId.toLowerCase().trim().replace(/\s+/g, '-');
      career = await this.careerRepository.getById(normalized);
      if (!career && (normalized === 'data-analysis' || normalized === 'data-analytics')) {
        career = await this.careerRepository.getById('data-analyst');
      }
      if (!career) {
        throw new CareerNotFoundError(careerId);
      }
    }

    // 1. Run ATS Analysis
    const atsAnalysis = ATSScoring.calculate(latest.textContent, career, profile);

    // 2. Run Skill Gap Analysis
    const skillGapAnalysis = ResumeSkillGap.analyze(latest.textContent, career, assessments);

    // 3. Generate Improvement Suggestions via AI Foundation Layer
    let improvementReport: ImprovementReport;
    try {
      const aiResponse = await AIService.analyzeResume(profile, 'upload');
      if (aiResponse.success && aiResponse.data) {
        const d = aiResponse.data as any;
        improvementReport = {
          strengths: d.strengths || ['Clear section structures'],
          weaknesses: d.weaknesses || ['Lacks metric impact statements'],
          missingKeywords: skillGapAnalysis.missingSkills,
          missingProjects: d.missingProjects || ['Add a project showcasing the target stack'],
          missingCertifications: d.missingCertifications || ['TensorFlow Certification recommended'],
          missingTechnologies: skillGapAnalysis.missingSkills,
          actionableSuggestions: d.actionableSuggestions || d.suggestions || ['Add missing skills keywords to project accomplishments']
        };
      } else {
        throw new Error(aiResponse.reason);
      }
    } catch (error) {
      console.warn('AI Resume analysis failed. Falling back to structured default improvements:', error);
      improvementReport = ResumeImprovements.generateDefaults(skillGapAnalysis.missingSkills);
    }

    // Update the version fields
    latest.atsAnalysis = atsAnalysis;
    latest.skillGapAnalysis = skillGapAnalysis;
    latest.improvementReport = improvementReport;
    (latest as any).analysisHash = currentHash;

    await this.repository.save(latest);

    // Synchronize backwards compatibility state on profile resume sub-state
    const updatedResume = {
      method: 'upload' as const,
      fileName: latest.fileName,
      atsScore: atsAnalysis.atsScore,
      strengths: improvementReport.strengths,
      weaknesses: improvementReport.weaknesses,
      missingSkills: skillGapAnalysis.missingSkills
    };

    profile.resume = updatedResume;
    await DbService.saveUserProfile(uid, profile);

    return latest;
  }

  /**
   * Gets the latest resume details.
   */
  async getLatestResume(uid: string): Promise<ResumeVersion> {
    const latest = await this.repository.getLatest(uid);
    if (!latest) {
      throw new Error('No uploaded resume version found.');
    }
    return latest;
  }

  /**
   * Gets full resume uploads history.
   */
  async getResumeHistory(uid: string): Promise<ResumeVersion[]> {
    return this.repository.getHistory(uid);
  }

  /**
   * Compares two versions side-by-side.
   */
  async compareVersions(
    versionAId: string,
    versionBId: string
  ): Promise<ResumeComparison> {
    const versionA = await this.repository.getById(versionAId);
    if (!versionA) throw new VersionNotFoundError(versionAId);

    const versionB = await this.repository.getById(versionBId);
    if (!versionB) throw new VersionNotFoundError(versionBId);

    const atsA = versionA.atsAnalysis?.atsScore || 0;
    const atsB = versionB.atsAnalysis?.atsScore || 0;

    const scoreDifference = atsA - atsB;

    // Resolve improved areas (where version A subscores are higher than B)
    const improvedAreas: string[] = [];
    if (versionA.atsAnalysis && versionB.atsAnalysis) {
      const a = versionA.atsAnalysis;
      const b = versionB.atsAnalysis;
      if (a.keywordScore > b.keywordScore) improvedAreas.push('Improved keyword match density.');
      if (a.skillsScore > b.skillsScore) improvedAreas.push('Better skills coverage matching.');
      if (a.projectsScore > b.projectsScore) improvedAreas.push('Quantified project summaries.');
      if (a.formattingScore > b.formattingScore) improvedAreas.push('Cleaner layout format headings.');
    }

    if (improvedAreas.length === 0) {
      improvedAreas.push('No significant score improvements detected between these versions.');
    }

    const remainingGaps = versionA.skillGapAnalysis?.missingSkills || [];

    return {
      versionA: {
        id: versionA.id,
        timestamp: versionA.timestamp,
        fileName: versionA.fileName,
        atsScore: atsA
      },
      versionB: {
        id: versionB.id,
        timestamp: versionB.timestamp,
        fileName: versionB.fileName,
        atsScore: atsB
      },
      scoreDifference,
      improvedAreas,
      remainingGaps
    };
  }
}
