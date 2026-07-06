import OpenAI from 'openai';
import { AIProvider } from './base';
import { ProviderError } from '../exceptions';
import { AIRequestManager } from '../services/request_manager';

// ─── Initialization ──────────────────────────────────────────────────────────

const API_KEY = process.env.OPENROUTER_API_KEY || '';
let openai: OpenAI | null = null;
let initError: string | null = null;

if (!API_KEY) {
  initError = 'OPENROUTER_API_KEY is missing from environment variables.';
  console.warn(`[OpenRouterProvider] ${initError}`);
} else {
  try {
    const maskedKey = `${API_KEY.substring(0, 6)}...${API_KEY.substring(API_KEY.length - 4)}`;
    console.log(`[OpenRouterProvider] Loaded OPENROUTER_API_KEY: ${maskedKey}`);

    openai = new OpenAI({
      apiKey: API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    console.log('[OpenRouterProvider] SDK initialized successfully.');

    // Perform startup health check request asynchronously so it does not block server boot
    (async () => {
      try {
        await openai!.chat.completions.create({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [{ role: 'user', content: 'ping' }],
        });
        console.log('[OpenRouterProvider] Startup health request succeeded.');
      } catch (error: any) {
        console.warn('[OpenRouterProvider] Startup health request failed (non-blocking warning):', error.message || error);
      }
    })();
  } catch (error: any) {
    initError = `SDK initialization failed: ${error.message}`;
    console.error(`[OpenRouterProvider] ${initError}`);
  }
}

// ─── Error Classification ─────────────────────────────────────────────────────

function classifyError(e: any, providerName: string): ProviderError {
  console.error('[OpenRouterProvider] Raw OpenRouter Error:', e);

  const msg: string = (e?.message || e?.toString() || '').toLowerCase();
  const status: number | undefined = e?.status ?? e?.statusCode ?? e?.response?.status;

  // 1. Invalid API Key
  if (
    status === 401 ||
    msg.includes('api key') ||
    msg.includes('api_key') ||
    msg.includes('invalid key') ||
    msg.includes('unauthenticated') ||
    msg.includes('unauthorized')
  ) {
    return new ProviderError(
      'InvalidApiKey: Invalid or unauthorized API key. Check OPENROUTER_API_KEY in your .env file.',
      providerName
    );
  }

  // 2. Rate Limit Exceeded
  if (
    status === 429 ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('quota') ||
    msg.includes('credits') ||
    msg.includes('insufficient balance')
  ) {
    return new ProviderError(
      'RateLimitExceeded: OpenRouter API rate limit reached or quota exhausted.',
      providerName
    );
  }

  // 3. Timeout
  if (msg.includes('timeout') || msg.includes('timed out') || status === 408) {
    return new ProviderError(
      'Timeout: Request to OpenRouter API timed out.',
      providerName
    );
  }

  // 4. Network Error
  if (
    msg.includes('network') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('fetch failed') ||
    msg.includes('dns')
  ) {
    return new ProviderError(
      'NetworkError: Network error reaching OpenRouter API. Verify internet connectivity.',
      providerName
    );
  }

  // 5. Configuration Error
  if (
    msg.includes('configuration') ||
    msg.includes('config') ||
    msg.includes('not initialized') ||
    msg.includes('missing')
  ) {
    return new ProviderError(
      'ConfigurationError: OpenRouter provider configuration is invalid or missing.',
      providerName
    );
  }

  // 6. Generation Error
  if (
    msg.includes('content') ||
    msg.includes('moderation') ||
    msg.includes('safety') ||
    msg.includes('blocked') ||
    msg.includes('empty response') ||
    msg.includes('generation')
  ) {
    return new ProviderError(
      'GenerationError: OpenRouter failed to generate a response.',
      providerName
    );
  }

  // Default: ProviderError
  return new ProviderError(
    `ProviderError: ${e?.message || 'Unknown error calling OpenRouter API.'}`,
    providerName
  );
}

// ─── Provider Implementation ──────────────────────────────────────────────────

export class OpenRouterProvider implements AIProvider {
  public name = 'OpenRouter';

  async generateText(
    promptText: string,
    systemInstruction?: string,
    jsonMode = false,
    model?: string
  ): Promise<string> {
    // Guard: initialization failure
    if (!openai) {
      throw new ProviderError(
        initError || 'OpenRouter SDK is not initialized.',
        this.name
      );
    }

    const executeCall = async () => {
      let attempts = 0;
      while (attempts < 2) {
        attempts++;
        try {
          const messages: any[] = [];
          if (systemInstruction) {
            messages.push({ role: 'system', content: systemInstruction });
          }
          messages.push({ role: 'user', content: promptText });

          const selectedModel = model || 'meta-llama/llama-3.3-70b-instruct:free';
          const response = await openai!.chat.completions.create({
            model: selectedModel,
            messages,
            response_format: jsonMode ? { type: 'json_object' } : undefined,
          });

          const text = response.choices?.[0]?.message?.content;
          if (!text || text.trim() === '') {
            throw new Error('empty response from OpenRouter model');
          }

          return text.trim();
        } catch (e: any) {
          console.warn(`[OpenRouterProvider] Attempt ${attempts} failed:`, e.message || e);
          if (attempts >= 2) {
            if (e instanceof ProviderError) throw e;
            throw classifyError(e, this.name);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      throw new ProviderError('Failed after retry', this.name);
    };

    return AIRequestManager.enqueue(promptText, systemInstruction, jsonMode, this.name, executeCall);
  }
}

// ─── Status Helper (used by /ai/test endpoint) ────────────────────────────────

export function getOpenRouterProviderStatus(): { ready: boolean; reason: string } {
  if (openai) {
    return { ready: true, reason: 'OpenRouter SDK initialized successfully.' };
  }
  return {
    ready: false,
    reason: initError || 'OpenRouter SDK not initialized (unknown reason).'
  };
}
