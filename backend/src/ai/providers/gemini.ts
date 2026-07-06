// @ts-nocheck
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './base';
import { ProviderError } from '../exceptions';
import { AIRequestManager } from '../services/request_manager';
import { AI_MODELS } from '../../config/models';

// ─── Initialization ──────────────────────────────────────────────────────────

const rawKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

const keys = rawKeys
  .map(k => k?.trim())
  .filter((k): k is string => !!k);

const clients: GoogleGenerativeAI[] = [];
let initError: string | null = null;
let currentKeyIndex = 0;

if (keys.length === 0) {
  initError = 'At least one of GEMINI_API_KEY_1, GEMINI_API_KEY_2, or GEMINI_API_KEY_3 must be provided in environment variables.';
  console.warn(`[GeminiProvider] ${initError}`);
} else {
  try {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const maskedKey = `${key.substring(0, 6)}...${key.substring(key.length - 4)}`;
      console.log(`[GeminiProvider] Loaded GEMINI_API_KEY_${i + 1}: ${maskedKey}`);
      clients.push(new GoogleGenerativeAI(key));
    }
    console.log(`[GeminiProvider] SDK initialized successfully with ${clients.length} key(s).`);

    // Perform startup health check request asynchronously using the first client so it does not block server boot
    (async () => {
      try {
        const model = clients[0].getGenerativeModel({ model: AI_MODELS.GEMINI_MODEL });
        await model.generateContent('ping');
        console.log('[GeminiProvider] Startup health request succeeded.');
      } catch (error: any) {
        console.warn('[GeminiProvider] Startup health request failed (non-blocking warning):', error.message || error);
      }
    })();
  } catch (error: any) {
    initError = `SDK initialization failed: ${error.message}`;
    console.error(`[GeminiProvider] ${initError}`);
  }
}

// ─── Error Classification ─────────────────────────────────────────────────────

/**
 * Maps raw Gemini / fetch errors to human-readable ProviderError messages.
 */
function classifyError(e: any, providerName: string): ProviderError {
  // TASK 2: Log the COMPLETE raw Google SDK error BEFORE classifyError()
  console.error('[GeminiProvider] Raw Google Error:', e);

  const msg: string = (e?.message || e?.toString() || '').toLowerCase();
  const status: number | undefined = e?.status ?? e?.statusCode ?? e?.response?.status;

  // 1. Invalid API Key
  if (
    status === 400 && msg.includes('api key not valid') ||
    status === 401 ||
    msg.includes('api key') ||
    msg.includes('api_key') ||
    msg.includes('invalid key') ||
    msg.includes('unauthenticated')
  ) {
    return new ProviderError(
      'InvalidAPIKey: Invalid or unauthorized API key. Check GEMINI_API_KEY in your .env file.',
      providerName
    );
  }

  // 2. Permission Denied
  if (status === 403 || msg.includes('permission denied') || msg.includes('permission') || msg.includes('forbidden')) {
    return new ProviderError(
      'PermissionDenied: Permission denied to access Gemini resource.',
      providerName
    );
  }

  // 3. Billing Required
  if (
    msg.includes('billing') ||
    msg.includes('billing not enabled') ||
    msg.includes('check your plan and billing')
  ) {
    return new ProviderError(
      'BillingRequired: Gemini API requires billing to be enabled. Check Google Cloud Billing setup.',
      providerName
    );
  }

  // 4. Quota Exceeded (limit: 0 or exhausted daily)
  if (
    msg.includes('quota exceeded') ||
    msg.includes('limit: 0') ||
    msg.includes('exceeded your current quota') ||
    msg.includes('free_tier_requests')
  ) {
    return new ProviderError(
      'QuotaExceeded: Gemini API quota has been exhausted. Wait and retry, or upgrade your plan.',
      providerName
    );
  }

  // 5. Rate Limited
  if (
    status === 429 ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('resource_exhausted')
  ) {
    return new ProviderError(
      'RateLimited: Gemini API rate limit reached. Please wait a moment before retrying.',
      providerName
    );
  }

  // 6. Model Not Found
  if (
    status === 404 ||
    msg.includes('model not found') ||
    msg.includes('invalid model')
  ) {
    return new ProviderError(
      "ModelNotFound: The requested model was not found.",
      providerName
    );
  }

  // 7. Model Not Supported
  if (
    msg.includes('not supported for generatecontent') ||
    msg.includes('not supported')
  ) {
    return new ProviderError(
      "ModelNotSupported: The requested model is not supported for generateContent.",
      providerName
    );
  }

  // 8. API Disabled (APIUnavailable)
  if (
    msg.includes('api disabled') ||
    msg.includes('service disabled') ||
    msg.includes('enable the api')
  ) {
    return new ProviderError(
      'APIUnavailable: The Generative Language API is disabled or unavailable.',
      providerName
    );
  }

  // 9. Region Restriction
  if (
    msg.includes('region') ||
    msg.includes('location not supported') ||
    msg.includes('geoblocked') ||
    msg.includes('not available in your country')
  ) {
    return new ProviderError(
      'RegionRestriction: Gemini API is not supported in your current region or location.',
      providerName
    );
  }

  // 10. Safety Blocked
  if (
    msg.includes('safety') ||
    msg.includes('blocked') ||
    msg.includes('candidate blocked') ||
    msg.includes('harmful')
  ) {
    return new ProviderError(
      'SafetyBlocked: The request was blocked by Gemini safety and content filters.',
      providerName
    );
  }

  // 11. Invalid Request
  if (
    status === 400 ||
    msg.includes('bad request') ||
    msg.includes('invalid argument')
  ) {
    return new ProviderError(
      'InvalidRequest: The request payload was invalid or malformed.',
      providerName
    );
  }

  // 12. Network Error
  if (
    msg.includes('network') ||
    msg.includes('enotfound') ||
    msg.includes('econnrefused') ||
    msg.includes('fetch failed') ||
    msg.includes('timeout') ||
    msg.includes('timed out')
  ) {
    return new ProviderError(
      'NetworkError: Network error reaching Gemini API. Verify internet connectivity.',
      providerName
    );
  }

  // 13. Server Error
  if (
    status === 500 ||
    status === 503 ||
    msg.includes('server error') ||
    msg.includes('unavailable')
  ) {
    return new ProviderError(
      'ServerError: Gemini API is temporarily unavailable (internal server error).',
      providerName
    );
  }

  // 14. Unknown Error
  return new ProviderError(e?.message || 'UnknownError: Unknown error calling Gemini API.', providerName);
}

// ─── Provider Implementation ──────────────────────────────────────────────────

export class GeminiProvider implements AIProvider {
  public name = 'Gemini';

  async generateText(
    promptText: string,
    systemInstruction?: string,
    jsonMode = false
  ): Promise<string> {
    // Guard: initialization failure
    if (clients.length === 0) {
      throw new ProviderError(
        initError || 'Gemini SDK is not initialized.',
        this.name
      );
    }

    const executeCall = async () => {
      let attempts = 0;
      const maxAttempts = clients.length;

      while (attempts < maxAttempts) {
        const client = clients[currentKeyIndex];
        try {
          const model = client.getGenerativeModel({
            model: AI_MODELS.GEMINI_MODEL,
            systemInstruction,
            generationConfig: jsonMode ? { responseMimeType: 'application/json' } : undefined
          });

          const result = await model.generateContent(promptText);
          const text = result.response.text();

          if (!text || text.trim() === '') {
            throw new Error('empty response from Gemini model');
          }

          return text.trim();
        } catch (e: any) {
          // Classify the error using the existing classifyError logic
          const classified = e instanceof ProviderError ? e : classifyError(e, this.name);
          
          // Check if the error is rate-limit, quota-exceeded, or 429-type error
          const isRateLimitOrQuota = 
            classified.message.startsWith('RateLimited:') || 
            classified.message.startsWith('QuotaExceeded:') ||
            classified.message.includes('rate limit') ||
            classified.message.includes('quota exceeded');

          if (isRateLimitOrQuota && attempts < maxAttempts - 1) {
            // Rotate the key: move to the next key index
            const oldIndex = currentKeyIndex;
            currentKeyIndex = (currentKeyIndex + 1) % clients.length;
            attempts++;
            console.warn(`[GeminiProvider] Request failed with rate-limit or quota-exceeded at key index ${oldIndex}. Rotating to key index ${currentKeyIndex} and retrying...`);
            continue;
          }

          // Otherwise, it's a different error or we've tried all available keys. Throw the classified error.
          throw classified;
        }
      }
      throw new ProviderError('All Gemini API keys failed.', this.name);
    };

    return AIRequestManager.enqueue(promptText, systemInstruction, jsonMode, this.name, executeCall);
  }
}

// ─── Status Helper (used by /ai/test endpoint) ────────────────────────────────

/**
 * Returns whether the Gemini SDK initialized successfully and the
 * reason if it did not — without exposing the raw API key.
 */
export function getGeminiProviderStatus(): { ready: boolean; reason: string } {
  if (clients.length > 0) {
    return { ready: true, reason: `Gemini SDK initialized successfully with ${clients.length} key(s).` };
  }
  return {
    ready: false,
    reason: initError || 'Gemini SDK not initialized (unknown reason).'
  };
}

