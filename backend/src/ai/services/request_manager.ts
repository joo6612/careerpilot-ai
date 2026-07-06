import { ProviderError } from '../exceptions';

interface QueueItem {
  id: string;
  priority: number;
  promptText: string;
  systemInstruction?: string;
  jsonMode?: boolean;
  execute: () => Promise<string>;
  resolve: (value: string) => void;
  reject: (error: any) => void;
  timestamp: number;
}

export class AIRequestManager {
  private static queue: QueueItem[] = [];
  private static activeRequests = 0;
  private static maxConcurrency = 1; // Strict single concurrent request
  
  // Rate limiting (max 12 Requests Per Minute to stay safely below 15 RPM limit)
  private static maxRPM = 12;
  private static executionTimestamps: number[] = [];
  private static lastRequestTime = 0;
  private static minRequestGapMs = 2000; // Throttle: 2 seconds minimum gap

  // Caching & Deduplication
  private static cache = new Map<string, { result: string; timestamp: number }>();
  private static cacheTTLMs = 60000; // 1 minute Cache TTL
  private static inFlight = new Map<string, Promise<string>>();

  /**
   * Determine Priority based on prompt signatures
   * Priority 1 (High): User chat, Onboarding, Mentor
   * Priority 2 (Medium): Resume Analysis, Career Discovery
   * Priority 3 (Low): Dashboard Refresh, Background Analytics, Recommendations
   */
  private static getPriority(promptText: string): number {
    const lower = promptText.toLowerCase();
    
    if (
      lower.includes('onboarding ai guide') ||
      lower.includes('ai career mentor') ||
      lower.includes('ai mentor') ||
      lower.includes('technical interviewer') ||
      lower.includes('candidate answer')
    ) {
      return 1;
    }
    
    if (
      lower.includes('analyze the resume') ||
      lower.includes('suitable target career titles') ||
      lower.includes('required for the career') ||
      lower.includes('analyze the candidate\'s profile against the top recommended')
    ) {
      return 2;
    }
    
    return 3;
  }

  /**
   * Main entry point to enqueue an AI request.
   */
  public static async enqueue(
    promptText: string,
    systemInstruction: string | undefined,
    jsonMode: boolean,
    providerName: string,
    executeFn: () => Promise<string>
  ): Promise<string> {
    // If it's a Mock provider, bypass queue to keep local dev fast & responsive
    if (providerName === 'Mock') {
      return executeFn();
    }

    const cacheKey = JSON.stringify({ promptText, systemInstruction, jsonMode });

    // 1. Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.cacheTTLMs)) {
      console.log('[AIRequestManager] Cache hit. Reusing cached AI result.');
      return cached.result;
    }

    // 2. Check Deduplication
    const activePromise = this.inFlight.get(cacheKey);
    if (activePromise) {
      console.log('[AIRequestManager] Deduplicating simultaneous request. Reusing active in-flight Promise.');
      return activePromise;
    }

    // 3. Create Enqueued Promise
    const promise = new Promise<string>((resolve, reject) => {
      const priority = this.getPriority(promptText);
      const item: QueueItem = {
        id: Math.random().toString(36).substring(7),
        priority,
        promptText,
        systemInstruction,
        jsonMode,
        execute: executeFn,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.queue.push(item);
      console.log(`[AIRequestManager] Request enqueued. Priority: ${priority}. Queue size: ${this.queue.length}`);
      this.sortQueue();
      this.processQueue();
    });

    // Save in-flight to deduplicate concurrent requests
    this.inFlight.set(cacheKey, promise);

    promise.then(
      (res) => {
        this.cache.set(cacheKey, { result: res, timestamp: Date.now() });
        this.inFlight.delete(cacheKey);
      },
      () => {
        this.inFlight.delete(cacheKey);
      }
    );

    return promise;
  }

  /**
   * Sort queue so Priority 1 tasks execute first, preserving FIFO order within same priority.
   */
  private static sortQueue() {
    this.queue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Ascending order: P1 first, then P2, then P3
      }
      return a.timestamp - b.timestamp; // FIFO for same priority
    });
  }

  /**
   * Processes the front of the queue, honoring concurrency, RPM, and throttle limits.
   */
  private static async processQueue() {
    if (this.activeRequests >= this.maxConcurrency) {
      return;
    }

    if (this.queue.length === 0) {
      return;
    }

    const now = Date.now();

    // Clean up timestamps older than 60 seconds
    this.executionTimestamps = this.executionTimestamps.filter(t => now - t < 60000);

    // Check RPM Limit
    if (this.executionTimestamps.length >= this.maxRPM) {
      const oldest = this.executionTimestamps[0];
      const delay = 60000 - (now - oldest);
      console.log(`[AIRequestManager] RPM Limit reached. Throttling queue processing. Retrying queue in ${delay}ms`);
      setTimeout(() => this.processQueue(), delay);
      return;
    }

    // Check Minimum Request Gap (Throttling)
    const elapsedSinceLast = now - this.lastRequestTime;
    if (elapsedSinceLast < this.minRequestGapMs) {
      const delay = this.minRequestGapMs - elapsedSinceLast;
      setTimeout(() => this.processQueue(), delay);
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.activeRequests++;
    this.lastRequestTime = Date.now();
    this.executionTimestamps.push(this.lastRequestTime);

    console.log(`[AIRequestManager] Executing queued request ID: ${item.id}. Priority: ${item.priority}`);

    this.runWithRetry(item, 1)
      .then((res) => {
        this.activeRequests--;
        item.resolve(res);
        this.processQueue();
      })
      .catch((err) => {
        this.activeRequests--;
        item.reject(err);
        this.processQueue();
      });
  }

  /**
   * Runs the task execution with exponential backoff on HTTP 429 errors.
   */
  private static async runWithRetry(item: QueueItem, attempt: number): Promise<string> {
    try {
      return await item.execute();
    } catch (error: any) {
      const isRateLimit = this.isRateLimitError(error);

      if (isRateLimit && attempt <= 3) {
        // Look for Retry-After recommendation or compute exponential backoff
        const retryAfterMs = this.getRetryAfterMs(error) || (Math.pow(2, attempt) * 1000 + Math.random() * 1000);
        console.warn(`[AIRequestManager] [429 RATE LIMIT] Attempt ${attempt} failed. Backing off for ${retryAfterMs}ms before retry...`);
        
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        return this.runWithRetry(item, attempt + 1);
      }

      // If we exhausted retries or it's a non-retryable error, return a friendly message
      if (isRateLimit) {
        console.error('[AIRequestManager] [ERROR] Rate limit retries exhausted.');
        throw new ProviderError(
          'AI is currently busy. Please try again in a few seconds.',
          'Gemini'
        );
      }

      throw error;
    }
  }

  /**
   * Checks if the thrown error is a 429 rate limit / quota exhaustion.
   */
  private static isRateLimitError(error: any): boolean {
    const msg = (error.message || '').toLowerCase();
    const status = error.status || error.statusCode || error.response?.status;
    return (
      status === 429 ||
      msg.includes('quota') ||
      msg.includes('rate limit') ||
      msg.includes('resource_exhausted') ||
      msg.includes('too many requests')
    );
  }

  /**
   * Parses the error object to find if a retry delay was suggested.
   */
  private static getRetryAfterMs(error: any): number | null {
    if (error.response?.headers) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        const sec = parseInt(retryAfter, 10);
        if (!isNaN(sec)) return sec * 1000;
      }
    }
    return null;
  }
}
