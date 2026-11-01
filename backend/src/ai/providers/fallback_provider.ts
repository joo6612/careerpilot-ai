import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './base';
import { MockProvider } from './mock';
import { AI_MODELS } from '../../config/models';
import { AIRequestManager } from '../services/request_manager';

interface KeyInstance {
  keyName: string;
  keyVal: string;
  masked: string;
  client: GoogleGenerativeAI;
}

interface ProjectState {
  name: string;
  providerType: 'gemini';
  keys: KeyInstance[];
  currentIndex: number;
  isAvailable: boolean;
  cooldownUntil: number;
  requestsServed: number;
  errors429Count: number;
}

function maskKey(key: string): string {
  if (!key) return '';
  if (key.length <= 10) return '***';
  return `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
}

function is429Error(err: any): boolean {
  const msg = (err?.message || err?.toString() || '').toLowerCase();
  const status = err?.status ?? err?.statusCode ?? err?.response?.status ?? err?.response?.statusCode;
  return (
    status === 429 ||
    msg.includes('429') ||
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('billing') ||
    msg.includes('credits') ||
    msg.includes('quota exceeded')
  );
}

/**
 * FallbackAIProvider
 * High-performance orchestrator utilizing Google Gemini tiers exclusively:
 * - Gemini Flash Lite: resume parsing, skills extraction, simple text
 * - Gemini Flash: fast interactive chat & general guidance
 * - Gemini Pro: complex career analysis, roadmaps, job description classification
 */
export class FallbackAIProvider implements AIProvider {
  public static instance: FallbackAIProvider | null = null;
  public name = 'Gemini';

  private projects: ProjectState[] = [];
  private mockProvider: MockProvider;

  constructor() {
    FallbackAIProvider.instance = this;
    this.mockProvider = new MockProvider();

    // 1. Scan process.env for all available GEMINI_API_KEY_ keys
    const geminiKeys: { name: string; val: string }[] = [];
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('GEMINI_API_KEY_')) {
        const val = process.env[key]?.trim();
        if (val) {
          geminiKeys.push({ name: key, val });
        }
      }
    }

    // Also pick up generic GEMINI_API_KEY if present and not in array
    if (process.env.GEMINI_API_KEY && !geminiKeys.some(k => k.val === process.env.GEMINI_API_KEY?.trim())) {
      geminiKeys.unshift({ name: 'GEMINI_API_KEY', val: process.env.GEMINI_API_KEY.trim() });
    }

    // Sort key names numerically
    geminiKeys.sort((a, b) => {
      const numA = parseInt(a.name.replace('GEMINI_API_KEY_', '').replace('GEMINI_API_KEY', '0'), 10) || 0;
      const numB = parseInt(b.name.replace('GEMINI_API_KEY_', '').replace('GEMINI_API_KEY', '0'), 10) || 0;
      return numA - numB;
    });

    const keysA: KeyInstance[] = [];
    const keysB: KeyInstance[] = [];
    const keysC: KeyInstance[] = [];

    for (const gk of geminiKeys) {
      const num = parseInt(gk.name.replace('GEMINI_API_KEY_', '').replace('GEMINI_API_KEY', '0'), 10) || 0;
      const masked = maskKey(gk.val);
      const client = new GoogleGenerativeAI(gk.val);
      const keyInstance: KeyInstance = {
        keyName: gk.name,
        keyVal: gk.val,
        masked,
        client
      };

      if (num <= 2) {
        keysA.push(keyInstance);
      } else if (num === 3) {
        keysB.push(keyInstance);
      } else {
        keysC.push(keyInstance);
      }
    }

    // Initialize Gemini Project Clusters
    this.projects.push({
      name: 'Project A (Gemini Primary)',
      providerType: 'gemini',
      keys: keysA,
      currentIndex: 0,
      isAvailable: true,
      cooldownUntil: 0,
      requestsServed: 0,
      errors429Count: 0
    });

    this.projects.push({
      name: 'Project B (Gemini Secondary)',
      providerType: 'gemini',
      keys: keysB,
      currentIndex: 0,
      isAvailable: true,
      cooldownUntil: 0,
      requestsServed: 0,
      errors429Count: 0
    });

    this.projects.push({
      name: 'Project C (Gemini Reserve)',
      providerType: 'gemini',
      keys: keysC,
      currentIndex: 0,
      isAvailable: true,
      cooldownUntil: 0,
      requestsServed: 0,
      errors429Count: 0
    });

    for (const p of this.projects) {
      console.log(`[AI] Loaded Gemini Cluster: ${p.name} with ${p.keys.length} key(s).`);
    }

    this.runStartupHealthChecks();
  }

  private runStartupHealthChecks() {
    for (const project of this.projects) {
      for (const keyInst of project.keys) {
        (async () => {
          try {
            const m = keyInst.client.getGenerativeModel({ model: AI_MODELS.GEMINI_FLASH_LITE });
            await m.generateContent('ping');
            console.log(`[AI Health] Key ${keyInst.keyName} in ${project.name} is active.`);
          } catch (err: any) {
            console.warn(`[AI Health] Key ${keyInst.keyName} health check warning: ${err?.message || err}`);
          }
        })();
      }
    }
  }

  private getNextKey(project: ProjectState): KeyInstance {
    const idx = project.currentIndex;
    project.currentIndex = (project.currentIndex + 1) % project.keys.length;
    return project.keys[idx];
  }

  /**
   * Resolves the optimal Gemini model tier based on task and payload requirements
   */
  private resolveOptimalModel(promptText: string, requestedModel?: string): string {
    if (requestedModel) {
      if (requestedModel.includes('flash-lite') || requestedModel.includes('8b')) return AI_MODELS.GEMINI_FLASH_LITE;
      if (requestedModel.includes('pro')) return AI_MODELS.GEMINI_PRO;
      return AI_MODELS.GEMINI_FLASH;
    }

    const pLower = promptText.toLowerCase();

    // 1. Gemini Flash Lite: resume parsing, skill extraction, quick tagging
    if (
      pLower.includes('extract technical skills') ||
      pLower.includes('skills extraction') ||
      pLower.includes('parse resume text') ||
      pLower.includes('extract resume details') ||
      pLower.includes('verify skill')
    ) {
      return AI_MODELS.GEMINI_FLASH_LITE;
    }

    // 2. Gemini Pro: complex roadmap generation, career matching analytics, readiness breakdown
    if (
      pLower.includes('roadmap') ||
      pLower.includes('milestones') ||
      pLower.includes('comprehensive') ||
      pLower.includes('career matching') ||
      pLower.includes('readiness score calculation')
    ) {
      return AI_MODELS.GEMINI_PRO;
    }

    // 3. Default: Gemini Flash (Fast & Natural Interaction)
    return AI_MODELS.GEMINI_FLASH;
  }

  async generateText(
    promptText: string,
    systemInstruction?: string,
    jsonMode = false,
    model?: string
  ): Promise<string> {
    const now = Date.now();

    // 1. Automatically recover cooldown projects
    for (const project of this.projects) {
      if (!project.isAvailable && now >= project.cooldownUntil) {
        project.isAvailable = true;
        console.log(`[AI] Cooldown expired for ${project.name}. Restoring availability.`);
      }
    }

    const targetModel = this.resolveOptimalModel(promptText, model);

    // 2. Iterate through available Gemini Clusters
    for (let i = 0; i < this.projects.length; i++) {
      const project = this.projects[i];
      if (!project.isAvailable || project.keys.length === 0) {
        continue;
      }

      let keyAttempt = 0;
      const numKeys = project.keys.length;
      let success = false;
      let resultText = '';

      while (keyAttempt < numKeys) {
        const keyInst = this.getNextKey(project);
        const idxInProject = project.keys.indexOf(keyInst);
        keyAttempt++;

        try {
          const executeCall = async () => {
            const modelObj = keyInst.client.getGenerativeModel({
              model: targetModel,
              systemInstruction,
              generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined
            });
            const response = await modelObj.generateContent(promptText);
            const text = response.response.text();
            if (!text || text.trim() === '') {
              throw new Error('empty response from Gemini model');
            }
            return text.trim();
          };

          resultText = await AIRequestManager.enqueue(promptText, systemInstruction, jsonMode, 'gemini', executeCall);

          project.requestsServed++;
          success = true;
          this.name = 'Gemini';
          break;
        } catch (err: any) {
          console.error(`[AI] Error on ${project.name} (Key #${idxInProject + 1}):`, err.message || err);

          if (is429Error(err)) {
            console.warn(`[AI] Rate limit hit on ${project.name}. Cooldown activated.`);
            project.errors429Count++;
            project.isAvailable = false;
            project.cooldownUntil = Date.now() + 60000;
            break;
          }
        }
      }

      if (success) {
        return resultText;
      }
    }

    // 3. Fallback to Mock Provider if all clusters are exhausted
    console.warn('[AI] All Gemini clusters unavailable or rate-limited. Falling back to structured response.');
    this.name = 'Mock';
    return this.mockProvider.generateText(promptText, systemInstruction, jsonMode, model);
  }

  getStatus() {
    const now = Date.now();
    return this.projects.map(p => {
      const isCooldown = !p.isAvailable && now < p.cooldownUntil;
      const remainingCooldown = isCooldown ? Math.ceil((p.cooldownUntil - now) / 1000) : 0;
      return {
        name: p.name,
        status: isCooldown ? 'Cooldown' : 'Healthy',
        remainingCooldown,
        requestsServed: p.requestsServed,
        error429Count: p.errors429Count,
        keysCount: p.keys.length
      };
    });
  }
}

export function getAIProviderManagerStatus() {
  if (FallbackAIProvider.instance) {
    return FallbackAIProvider.instance.getStatus();
  }
  return [];
}
