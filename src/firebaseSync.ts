import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc,
  deleteDoc, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  initialMembers, 
  initialReports, 
  initialDonations, 
  initialElections, 
  initialNews, 
  initialAds 
} from './initialData';

// Error Handling according to Firebase integration skill instructions.
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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

/**
 * Checks connectivity by calling getDocFromServer on a dummy ref.
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
  }
}

/**
 * Helper to seed a collection with initial data if it's completely empty.
 */
async function seedCollectionIfEmpty<T extends { id: string }>(collectionPath: string, initialData: T[]) {
  try {
    const qSnap = await getDocs(collection(db, collectionPath));
    if (qSnap.empty) {
      console.log(`Seeding empty collection "${collectionPath}" with initial records...`);
      const batch = writeBatch(db);
      initialData.forEach((item) => {
        const docRef = doc(db, collectionPath, item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
      console.log(`Collection "${collectionPath}" successfully seeded.`);
    }
  } catch (error) {
    console.warn(`Could not seed collection "${collectionPath}". It might already have data or rules restrictions:`, error);
  }
}

/**
 * Seeds all required collections inside current Firestore target.
 */
export async function seedAllCollections() {
  await seedCollectionIfEmpty('members', initialMembers);
  await seedCollectionIfEmpty('reports', initialReports);
  await seedCollectionIfEmpty('donations', initialDonations);
  await seedCollectionIfEmpty('elections', initialElections);
  await seedCollectionIfEmpty('news', initialNews);
  await seedCollectionIfEmpty('advertisements', initialAds);
}

/**
 * Fetch a generic collection from Firestore.
 */
export async function fetchCollection<T>(collectionPath: string): Promise<T[]> {
  try {
    const qSnap = await getDocs(collection(db, collectionPath));
    return qSnap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
    return [];
  }
}

/**
 * Sets a specific document inside current Firestore target.
 */
export async function saveDocument<T extends object>(collectionPath: string, docId: string, data: T): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
  }
}

/**
 * Adds a new document with an auto-generated ID.
 */
export async function addDocument<T extends object>(collectionPath: string, data: T): Promise<string> {
  try {
    const colRef = collection(db, collectionPath);
    const docRef = await addDoc(colRef, data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
    return '';
  }
}

/**
 * Deletes a document from a collection.
 */
export async function deleteDocument(collectionPath: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${docId}`);
  }
}
