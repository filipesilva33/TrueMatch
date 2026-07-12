// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdfVVBgPMxzxxLpsgQ8sGqykzOnlolrO8",
  authDomain: "truematch-3c728.firebaseapp.com",
  projectId: "truematch-3c728",
  storageBucket: "truematch-3c728.firebasestorage.app",
  messagingSenderId: "56274507858",
  appId: "1:56274507858:web:f1038099d30c0ed237a78b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use custom database ID only if we are using the platform's default project
const databaseId = firebaseConfig.projectId === "ace-nucleus-807pf"
  ? "ai-studio-truematchai-9b496603-02db-4df3-9465-3bc37f48c237"
  : undefined;

// Initialize Firestore with dynamic database fallback
export const db = getFirestore(app, databaseId);

// Initialize Auth
export const auth = getAuth(app);

// Standardized Operation Types
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Structured Firestore Error Interface
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Centralized error handler throwing structured errors
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// No automatic connection test on boot to avoid startup failures in sandboxed/offline environments

