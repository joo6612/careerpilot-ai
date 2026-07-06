import { DbService } from './db';
import type { UserProfile } from '../types';

export class ProfileRepository {
  /**
   * Retrieves user profile from the database layer.
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    return DbService.getUserProfile(uid);
  }

  /**
   * Saves or merges user profile changes in the database.
   */
  async saveProfile(uid: string, profile: UserProfile): Promise<void> {
    await DbService.saveUserProfile(uid, profile);
  }
}
export default ProfileRepository;
