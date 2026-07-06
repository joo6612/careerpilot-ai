export const CareerValidators = {
  /**
   * Asserts and formats career ID parameters.
   */
  validateId(id: string): string {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('Career ID must be a non-empty string');
    }
    return id.trim();
  },

  /**
   * Cleans and checks search query strings.
   */
  validateSearchQuery(query: any): string {
    if (query === undefined || query === null) {
      return '';
    }
    return String(query).trim();
  },

  /**
   * Normalizes category inputs.
   */
  validateCategory(category: any): string {
    if (category === undefined || category === null) {
      return '';
    }
    return String(category).trim();
  }
};
