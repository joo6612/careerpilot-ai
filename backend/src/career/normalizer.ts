import { CAREER_CATALOG } from './catalog';

export class CareerNormalizer {
  private static mappings: Record<string, string> = {
    'uiuxdesigner': 'UI_UX_DESIGNER',
    'uiuxproductdesigner': 'UI_UX_DESIGNER',
    'productdesigner': 'UI_UX_DESIGNER',
    'uidesigner': 'UI_UX_DESIGNER',
    'uxdesigner': 'UI_UX_DESIGNER',
    'remoteuiuxproductdesigner': 'UI_UX_DESIGNER',
    'uiux': 'UI_UX_DESIGNER',
    'design': 'UI_UX_DESIGNER',
    'designer': 'UI_UX_DESIGNER',
    
    'machinelearningengineer': 'ML_ENGINEER',
    'mlengineer': 'ML_ENGINEER',
    'machinelearning': 'ML_ENGINEER',
    
    'aiengineer': 'AI_ENGINEER',
    'artificialintelligenceengineer': 'AI_ENGINEER',
    'ai': 'AI_ENGINEER',
    
    'backenddeveloper': 'BACKEND_ENGINEER',
    'backendengineer': 'BACKEND_ENGINEER',
    'backend': 'BACKEND_ENGINEER',
    
    'datascientist': 'DATA_SCIENTIST',
    'datascience': 'DATA_SCIENTIST',
    
    'frontendengineer': 'FRONTEND_ENGINEER',
    'frontenddeveloper': 'FRONTEND_ENGINEER',
    'frontend': 'FRONTEND_ENGINEER',
    
    'cloudengineer': 'CLOUD_ENGINEER',
    'cloudarchitect': 'CLOUD_ENGINEER',
    'cloud': 'CLOUD_ENGINEER',
    
    'devopsengineer': 'DEVOPS_ENGINEER',
    'devops': 'DEVOPS_ENGINEER',
    
    'cybersecurityanalyst': 'CYBERSECURITY_ANALYST',
    'cybersecurityengineer': 'CYBERSECURITY_ANALYST',
    'securityanalyst': 'CYBERSECURITY_ANALYST',
    'cybersecurity': 'CYBERSECURITY_ANALYST',
    'security': 'CYBERSECURITY_ANALYST',
    
    'dataanalyst': 'DATA_ANALYST',
    
    'fullstackdeveloper': 'FULL_STACK_DEVELOPER',
    'fullstackengineer': 'FULL_STACK_DEVELOPER',
    'fullstack': 'FULL_STACK_DEVELOPER'
  };

  /**
   * Normalizes any input title or ID to a canonical catalog ID.
   */
  public static normalize(input: string): string {
    if (!input) return 'BACKEND_ENGINEER';

    const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // 1. Direct mappings check
    if (this.mappings[cleaned]) {
      return this.mappings[cleaned];
    }

    // 2. Substring/Contains check
    for (const key in this.mappings) {
      if (cleaned.includes(key) || key.includes(cleaned)) {
        return this.mappings[key];
      }
    }

    // 3. Fallback: fuzzy/closest match based on similarity against catalog titles
    let bestMatchId = 'BACKEND_ENGINEER';
    let maxSimilarity = 0;

    for (const career of CAREER_CATALOG) {
      const canonId = career.id.toUpperCase().replace(/-/g, '_');
      const titleCleaned = career.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const sim = this.getSimilarity(cleaned, titleCleaned);
      if (sim > maxSimilarity) {
        maxSimilarity = sim;
        bestMatchId = canonId;
      }
    }

    return bestMatchId;
  }

  private static getSimilarity(s1: string, s2: string): number {
    let matches = 0;
    const len = Math.max(s1.length, s2.length);
    if (len === 0) return 0;
    
    for (let i = 0; i < s1.length; i++) {
      if (s2.includes(s1[i])) {
        matches++;
      }
    }
    return matches / len;
  }
}
