import { GeminiProvider } from '../ai/providers/gemini';
import { MockProvider } from '../ai/providers/mock';
import { AIProvider } from '../ai/providers/base';

const API_KEY = process.env.GEMINI_API_KEY || '';
const isProduction = process.env.NODE_ENV === 'production';
const allowMock = !isProduction || process.env.ALLOW_MOCK_FALLBACK === 'true';

class MissingProvider implements AIProvider {
  public name = 'Gemini';
  async generateText(): Promise<string> {
    throw new Error('GEMINI_API_KEY is missing from environment variables in production. Mock fallback is disabled.');
  }
}

const provider: AIProvider = API_KEY
  ? new GeminiProvider()
  : (allowMock ? new MockProvider() : new MissingProvider());

export const GeminiService = {
  /**
   * Returns true if operating in local simulation mode (no API key).
   */
  isSimulationMode(): boolean {
    return !API_KEY && allowMock;
  },

  /**
   * Low-level raw text/JSON completion method calling the active AIProvider.
   */
  async generateText(
    promptText: string,
    systemInstruction?: string,
    jsonMode = false
  ): Promise<string> {
    return provider.generateText(promptText, systemInstruction, jsonMode);
  }
};
