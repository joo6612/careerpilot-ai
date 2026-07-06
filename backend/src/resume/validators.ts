export const ResumeValidators = {
  /**
   * Asserts upload content properties are non-empty strings.
   */
  validateUpload(body: any): { textContent: string; fileName: string } {
    const textContent = String(body.textContent || '').trim();
    const fileName = String(body.fileName || '').trim();

    if (!textContent) {
      throw new Error('Resume textContent is required for processing');
    }
    return { textContent, fileName: fileName || 'resume.txt' };
  },

  /**
   * Asserts target compare version IDs are defined.
   */
  validateCompare(query: any): { versionA: string; versionB: string } {
    const versionA = String(query.versionA || '').trim();
    const versionB = String(query.versionB || '').trim();

    if (!versionA || !versionB) {
      throw new Error('Both versionA and versionB query parameters are required for comparative history report');
    }
    return { versionA, versionB };
  }
};
export default ResumeValidators;
