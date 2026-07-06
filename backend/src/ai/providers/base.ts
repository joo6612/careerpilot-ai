export interface AIProvider {
  name: string;
  generateText(promptText: string, systemInstruction?: string, jsonMode?: boolean, model?: string): Promise<string>;
}
