import { Career } from './models';
import { CareerRepository } from './repository';
import { CareerNotFoundError } from './exceptions';

export class CareerService {
  constructor(private repository: CareerRepository) {}

  /**
   * Returns all careers, with optional category filtering.
   */
  async getAllCareers(category?: string): Promise<Career[]> {
    const list = await this.repository.getAll();
    if (category) {
      const catLower = category.toLowerCase().trim();
      return list.filter(c => c.category.toLowerCase() === catLower);
    }
    return list;
  }

  /**
   * Retrieves a career profile by its unique ID. Throws CareerNotFoundError if absent.
   */
  async getCareerById(id: string): Promise<Career> {
    const career = await this.repository.getById(id);
    if (!career) {
      throw new CareerNotFoundError(id);
    }
    return career;
  }

  /**
   * Performs text-match search operations.
   */
  async searchCareers(query: string): Promise<Career[]> {
    return this.repository.search(query);
  }

  /**
   * Lists distinct categories.
   */
  async getCategories(): Promise<string[]> {
    return this.repository.getCategories();
  }

  /**
   * Extracts detailed skills arrays categorized by expertise.
   */
  async getRequiredSkills(id: string): Promise<{
    required: string[];
    beginner: string[];
    intermediate: string[];
    advanced: string[];
  }> {
    const career = await this.getCareerById(id);
    return {
      required: career.requiredSkills,
      beginner: career.beginnerSkills,
      intermediate: career.intermediateSkills,
      advanced: career.advancedSkills
    };
  }

  /**
   * Resolves the stringified roadmap template into parsed JSON objects.
   */
  async getRoadmapTemplate(id: string): Promise<any[]> {
    const career = await this.getCareerById(id);
    try {
      return JSON.parse(career.roadmapTemplate);
    } catch (e) {
      throw new Error(`Failed to parse roadmap template for career: ${id}`);
    }
  }

  /**
   * Extracts professional certifications configured for the career.
   */
  async getRecommendedCertifications(id: string): Promise<string[]> {
    const career = await this.getCareerById(id);
    return career.certifications;
  }
}
