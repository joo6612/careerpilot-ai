import { Career } from './models';
import { CAREER_CATALOG } from './catalog';

import { CareerNormalizer } from './normalizer';

export interface CareerRepository {
  getAll(): Promise<Career[]>;
  getById(id: string): Promise<Career | null>;
  search(query: string): Promise<Career[]>;
  getCategories(): Promise<string[]>;
}

export class LocalCareerRepository implements CareerRepository {
  /**
   * Returns all available career profiles in memory.
   */
  async getAll(): Promise<Career[]> {
    return CAREER_CATALOG;
  }

  /**
   * Retrieves a single career details by its unique string ID.
   */
  async getById(id: string): Promise<Career | null> {
    const normId = CareerNormalizer.normalize(id);
    const career = CAREER_CATALOG.find(c => c.id === normId || c.id.toUpperCase().replace(/-/g, '_') === normId);
    return career || CAREER_CATALOG[0];
  }

  /**
   * Performs basic text filtering across title, descriptions, and tags.
   */
  async search(query: string): Promise<Career[]> {
    const qLower = query.toLowerCase().trim();
    if (!qLower) return CAREER_CATALOG;

    return CAREER_CATALOG.filter(
      c =>
        c.title.toLowerCase().includes(qLower) ||
        c.shortDescription.toLowerCase().includes(qLower) ||
        c.tags.some(t => t.toLowerCase().includes(qLower))
    );
  }

  /**
   * Returns unique distinct categories present across all careers.
   */
  async getCategories(): Promise<string[]> {
    const categories = CAREER_CATALOG.map(c => c.category);
    return Array.from(new Set(categories));
  }
}
