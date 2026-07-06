import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { AIProvider } from './base';
import { MockProvider } from './mock';
import { AI_MODELS } from '../../config/models';
import { AIRequestManager } from '../services/request_manager';

interface KeyInstance {
  keyName: string;
  keyVal: string;
  masked: string;
  client: any;
}

interface ProjectState {
  name: string;
  providerType: 'gemini' | 'openrouter';
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
    msg.includes('insufficient balance') ||
    msg.includes('quota exceeded')
  );
}

export class FallbackAIProvider implements AIProvider {
  public static instance: FallbackAIProvider | null = null;
  public name = 'FallbackAIProvider';
  
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

    // Sort key names numerically (e.g. GEMINI_API_KEY_1 -> 1, GEMINI_API_KEY_10 -> 10)
    geminiKeys.sort((a, b) => {
      const numA = parseInt(a.name.replace('GEMINI_API_KEY_', ''), 10) || 0;
      const numB = parseInt(b.name.replace('GEMINI_API_KEY_', ''), 10) || 0;
      return numA - numB;
    });

    const keysA: KeyInstance[] = [];
    const keysB: KeyInstance[] = [];
    const keysC: KeyInstance[] = [];

    // Distribute Gemini keys according to Project Groupings:
    // Project A: GEMINI_API_KEY_1, GEMINI_API_KEY_2
    // Project B: GEMINI_API_KEY_3
    // Project C: GEMINI_API_KEY_4 and any subsequent keys
    for (const gk of geminiKeys) {
      const num = parseInt(gk.name.replace('GEMINI_API_KEY_', ''), 10) || 0;
      const masked = maskKey(gk.val);
      const client = new GoogleGenerativeAI(gk.val);
      const keyInstance: KeyInstance = {
        keyName: gk.name,
        keyVal: gk.val,
        masked,
        client
      };

      if (num === 1 || num === 2) {
        keysA.push(keyInstance);
      } else if (num === 3) {
        keysB.push(keyInstance);
      } else {
        keysC.push(keyInstance);
      }
    }

    // Initialize Project States
    this.projects.push({
      name: 'Project A',
      providerType: 'gemini',
      keys: keysA,
      currentIndex: 0,
      isAvailable: true,
      cooldownUntil: 0,
      requestsServed: 0,
      errors429Count: 0
    });

    this.projects.push({
      name: 'Project B',
      providerType: 'gemini',
      keys: keysB,
      currentIndex: 0,
      isAvailable: true,
      cooldownUntil: 0,
      requestsServed: 0,
      errors429Count: 0
    });

    this.projects.push({
      name: 'Project C',
      providerType: 'gemini',
      keys: keysC,
      currentIndex: 0,
      isAvailable: true,
      cooldownUntil: 0,
      requestsServed: 0,
      errors429Count: 0
    });

    // 2. OpenRouter initialization
    const orKey = process.env.OPENROUTER_API_KEY?.trim() || '';
    const keysOR: KeyInstance[] = [];
    if (orKey) {
      const client = new OpenAI({
        apiKey: orKey,
        baseURL: 'https://openrouter.ai/api/v1',
      });
      keysOR.push({
        keyName: 'OPENROUTER_API_KEY',
        keyVal: orKey,
        masked: maskKey(orKey),
        client
      });
    }

    this.projects.push({
      name: 'OpenRouter',
      providerType: 'openrouter',
      keys: keysOR,
      currentIndex: 0,
      isAvailable: true,
      cooldownUntil: 0,
      requestsServed: 0,
      errors429Count: 0
    });

    // 3. Log loaded keys status
    for (const p of this.projects) {
      console.log(`[AI] Loaded project: ${p.name} with ${p.keys.length} key(s).`);
    }

    // 4. Perform startup health checks asynchronously so they never block server boot
    this.runStartupHealthChecks();
  }

  private runStartupHealthChecks() {
    for (const project of this.projects) {
      for (const keyInst of project.keys) {
        (async () => {
          try {
            if (project.providerType === 'gemini') {
              const modelName = AI_MODELS.GEMINI_MODEL || 'gemini-2.5-flash';
              const model = keyInst.client.getGenerativeModel({ model: modelName });
              await model.generateContent('ping');
            } else {
              await keyInst.client.chat.completions.create({
                model: 'meta-llama/llama-3.3-70b-instruct:free',
                messages: [{ role: 'user', content: 'ping' }],
              });
            }
            console.log(`[AI] Startup health check succeeded for ${project.name} (${keyInst.keyName}).`);
          } catch (error: any) {
            console.warn(`[AI] Startup health check warning for ${project.name} (${keyInst.keyName}):`, error.message || error);
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

    // 2. Iterate through available projects: Project A -> Project B -> Project C -> OpenRouter
    for (let i = 0; i < this.projects.length; i++) {
      const project = this.projects[i];
      if (!project.isAvailable || project.keys.length === 0) {
        continue;
      }

      console.log(`[AI] Using ${project.name}`);

      let keyAttempt = 0;
      const numKeys = project.keys.length;
      let success = false;
      let resultText = '';

      // Try keys in project (Smart Retry: only once per key)
      while (keyAttempt < numKeys) {
        // Select key using Round Robin
        const keyInst = this.getNextKey(project);
        const idxInProject = project.keys.indexOf(keyInst);
        keyAttempt++;

        console.log(`[AI] Using Key #${idxInProject + 1}`);

        try {
          if (project.providerType === 'gemini') {
            const executeCall = async () => {
              const modelName = AI_MODELS.GEMINI_MODEL || 'gemini-2.5-flash';
              const modelObj = keyInst.client.getGenerativeModel({
                model: modelName,
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
          } else {
            const executeCall = async () => {
              const selectedModel = model || 'meta-llama/llama-3.3-70b-instruct:free';
              const messages: any[] = [];
              if (systemInstruction) {
                messages.push({ role: 'system', content: systemInstruction });
              }
              messages.push({ role: 'user', content: promptText });
              const response = await keyInst.client.chat.completions.create({
                model: selectedModel,
                messages,
                response_format: jsonMode ? { type: 'json_object' } : undefined,
              });
              const text = response.choices?.[0]?.message?.content;
              if (!text || text.trim() === '') {
                throw new Error('empty response from OpenRouter model');
              }
              return text.trim();
            };
            resultText = await AIRequestManager.enqueue(promptText, systemInstruction, jsonMode, 'openrouter', executeCall);
          }

          // Success!
          project.requestsServed++;
          success = true;
          this.name = project.providerType === 'gemini' ? 'Gemini' : 'OpenRouter';
          console.log(`[AI] ${project.name} success`);
          break; // break key attempts loop
        } catch (err: any) {
          console.error(`[AI] Error on ${project.name} with key ${keyInst.keyName}:`, err.message || err);

          if (is429Error(err)) {
            console.warn(`[AI] 429 received`);
            project.errors429Count++;

            // Cooldown entire project for 60 seconds
            project.isAvailable = false;
            project.cooldownUntil = Date.now() + 60000;

            // Find next available target name for the logging requirement
            const nextProj = this.projects.slice(i + 1).find(p => p.isAvailable && p.keys.length > 0);
            const nextName = nextProj ? nextProj.name : 'Mock';
            console.warn(`[AI] Switching to ${nextName}`);
            
            // Immediately stop trying this project and failover to the next project
            break; 
          }
          // Non-429 errors continue to next key within project (Smart Retry once per key)
        }
      }

      if (success) {
        return resultText;
      }
    }

    // 3. Fallback to Mock Provider if all else fails
    console.error('[AI] All projects failed. Returning mock provider response.');
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
