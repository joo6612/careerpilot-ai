import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import type { UserProfile, RoadmapItem, ChatMessage } from '../types';
import { DemoUserService } from './demo_user_service';

// Local file database config
const LOCAL_DB_DIR = path.join(__dirname, '../../data');
const LOCAL_DB_FILE = path.join(LOCAL_DB_DIR, 'db.json');

// Initialize Firebase Admin if configuration is present
let firestore: admin.firestore.Firestore | null = null;

try {
  if (!admin.apps.length) {
    const serviceAccountPath = path.join(__dirname, '../../config/serviceAccountKey.json');
    let serviceAccount: any = null;
    if (fs.existsSync(serviceAccountPath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      } catch (err) {
        console.error('Error reading serviceAccountKey.json:', err);
      }
    }

    const envProjectId = process.env.FIREBASE_PROJECT_ID;
    const envClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const envPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    console.log("PROJECT:", process.env.FIREBASE_PROJECT_ID);
    console.log("EMAIL:", process.env.FIREBASE_CLIENT_EMAIL);
    console.log(
      "PRIVATE:",
      process.env.FIREBASE_PRIVATE_KEY ? "YES" : "NO"
    );

    let firebaseCredentials: admin.ServiceAccount | null = null;
    if (serviceAccount) {
      firebaseCredentials = serviceAccount as admin.ServiceAccount;
    } else if (envProjectId && envClientEmail && envPrivateKey) {
      firebaseCredentials = {
        projectId: envProjectId,
        clientEmail: envClientEmail,
        privateKey: envPrivateKey.replace(/\\n/g, '\n')
      } as admin.ServiceAccount;
    }

    if (firebaseCredentials) {
      const projectId = serviceAccount?.project_id || firebaseCredentials.projectId;
      admin.initializeApp({
        credential: admin.credential.cert(firebaseCredentials),
        projectId
      });

      const db = admin.firestore();
      db.settings({
        databaseId: '(default)',
        projectId,
        ignoreUndefinedProperties: true
      });
      firestore = db;

      console.log(`Firebase Admin initialized successfully for project: ${projectId} on database: (default)`);
    } else {
      console.log('No serviceAccountKey.json found, skipping Firebase initialization.');
    }
  }
} catch (error) {
  console.error('Failed to initialize Firebase Admin, falling back to local file database:', error);
}

// Local File DB Helper functions
interface LocalSchema {
  profiles: Record<string, UserProfile>;
  roadmaps: Record<string, RoadmapItem[]>;
  chats: Record<string, ChatMessage[]>;
}

const initLocalDb = () => {
  if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOCAL_DB_FILE)) {
    const defaultData: LocalSchema = {
      profiles: {},
      roadmaps: {},
      chats: {}
    };
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
  }
};

const readLocalDb = (): LocalSchema => {
  initLocalDb();
  try {
    const data = fs.readFileSync(LOCAL_DB_FILE, 'utf8');
    return JSON.parse(data) as LocalSchema;
  } catch (error) {
    console.error('Error reading local db file, returning empty schema:', error);
    return { profiles: {}, roadmaps: {}, chats: {} };
  }
};

const writeLocalDb = (data: LocalSchema) => {
  initLocalDb();
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to local db file:', error);
  }
};

// Expose DB Operations
export const DbService = {
  // Profiles
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (DemoUserService.isDemoUid(uid)) {
      const session = DemoUserService.getSessionByUid(uid);
      return session ? session.profile : null;
    }
    if (firestore) {
      try {
        const doc = await firestore.collection('profiles').doc(uid).get();
        if (doc.exists) {
          return doc.data() as UserProfile;
        }
        return null;
      } catch (error) {
        console.error(`Firestore error in getUserProfile for ${uid}:`, error);
        // Fall through to local file DB
      }
    }

    // File DB Fallback
    const localDb = readLocalDb();
    return localDb.profiles[uid] || null;
  },

  async saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
    if (DemoUserService.isDemoUid(uid)) {
      console.log('[DEMO MODE] Firestore write skipped');
      const session = DemoUserService.getSessionByUid(uid);
      if (session) {
        session.profile = profile;
      }
      return;
    }
    if (firestore) {
      try {
        await firestore.collection('profiles').doc(uid).set(profile, { merge: true });
        return;
      } catch (error) {
        console.error(`Firestore error in saveUserProfile for ${uid}:`, error);
        // Fall through to local file DB
      }
    }

    // File DB Fallback
    const localDb = readLocalDb();
    localDb.profiles[uid] = {
      ...localDb.profiles[uid],
      ...profile
    };
    writeLocalDb(localDb);
  },

  // Roadmaps
  async getUserRoadmap(uid: string): Promise<RoadmapItem[] | null> {
    if (DemoUserService.isDemoUid(uid)) {
      const session = DemoUserService.getSessionByUid(uid);
      return session ? session.roadmap : null;
    }
    if (firestore) {
      try {
        const doc = await firestore.collection('roadmaps').doc(uid).get();
        if (doc.exists) {
          return (doc.data() as { items: RoadmapItem[] }).items;
        }
        return null;
      } catch (error) {
        console.error(`Firestore error in getUserRoadmap for ${uid}:`, error);
      }
    }

    const localDb = readLocalDb();
    return localDb.roadmaps[uid] || null;
  },

  async saveUserRoadmap(uid: string, roadmap: RoadmapItem[]): Promise<void> {
    if (DemoUserService.isDemoUid(uid)) {
      console.log('[DEMO MODE] Firestore write skipped');
      const session = DemoUserService.getSessionByUid(uid);
      if (session) {
        session.roadmap = roadmap;
      }
      return;
    }
    if (firestore) {
      try {
        await firestore.collection('roadmaps').doc(uid).set({ items: roadmap });
        return;
      } catch (error) {
        console.error(`Firestore error in saveUserRoadmap for ${uid}:`, error);
      }
    }

    const localDb = readLocalDb();
    localDb.roadmaps[uid] = roadmap;
    writeLocalDb(localDb);
  },

  // Chat History
  async getUserChat(uid: string): Promise<ChatMessage[] | null> {
    const actualUid = uid.endsWith('-onboarding') ? uid.slice(0, -11) : uid;
    if (DemoUserService.isDemoUid(actualUid)) {
      const session = DemoUserService.getSessionByUid(actualUid);
      return session ? session.chat : null;
    }
    if (firestore) {
      try {
        const doc = await firestore.collection('chats').doc(uid).get();
        if (doc.exists) {
          return (doc.data() as { messages: ChatMessage[] }).messages;
        }
        return null;
      } catch (error) {
        console.error(`Firestore error in getUserChat for ${uid}:`, error);
      }
    }

    const localDb = readLocalDb();
    return localDb.chats[uid] || null;
  },

  async saveUserChat(uid: string, chat: ChatMessage[]): Promise<void> {
    const actualUid = uid.endsWith('-onboarding') ? uid.slice(0, -11) : uid;
    if (DemoUserService.isDemoUid(actualUid)) {
      console.log('[DEMO MODE] Firestore write skipped');
      const session = DemoUserService.getSessionByUid(actualUid);
      if (session) {
        session.chat = chat;
      }
      return;
    }
    if (firestore) {
      try {
        await firestore.collection('chats').doc(uid).set({ messages: chat });
        return;
      } catch (error) {
        console.error(`Firestore error in saveUserChat for ${uid}:`, error);
      }
    }

    const localDb = readLocalDb();
    localDb.chats[uid] = chat;
    writeLocalDb(localDb);
  }
};
