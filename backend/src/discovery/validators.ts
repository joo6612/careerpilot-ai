export const DiscoveryValidators = {
  /**
   * Asserts both target careers are specified for comparative analysis.
   */
  validateCompareParams(query: any): { careerA: string; careerB: string } {
    const careerA = String(query.careerA || '').trim();
    const careerB = String(query.careerB || '').trim();
    if (!careerA || !careerB) {
      throw new Error('Both careerA and careerB query parameters are required for comparative matching');
    }
    return { careerA, careerB };
  }
};
export default DiscoveryValidators;
