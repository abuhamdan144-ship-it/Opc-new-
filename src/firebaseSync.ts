import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { 
  initialMembers, 
  initialReports, 
  initialDonations, 
  initialElections, 
  initialNews, 
  initialAds 
} from './initialData';
import { Member, EmergencyReport, Donation, Election, NewsItem, Advertisement } from './types';

// --- Test Connection Constraint ---
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'connection_test'));
    console.log("Firebase connection verified and fully online.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is offline.");
    }
    return false;
  }
}

// Helper to seed a collection if it is completely empty
async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string, 
  defaultData: T[]
) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    if (querySnapshot.empty) {
      console.log(`Seeding Firestore collection: "${collectionName}" with initial data...`);
      const batch = writeBatch(db);
      defaultData.forEach((item) => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
    }
  } catch (error) {
    console.warn(`Failed to seed ${collectionName}:`, error);
  }
}

// --- Sync Initialization ---
export async function initializeFirestoreData() {
  await testFirestoreConnection();
  
  // Seed each collection with its beautiful initial mock set if empty
  await seedCollectionIfEmpty('members', initialMembers);
  await seedCollectionIfEmpty('reports', initialReports);
  await seedCollectionIfEmpty('donations', initialDonations);
  await seedCollectionIfEmpty('elections', initialElections);
  await seedCollectionIfEmpty('news', initialNews);
  await seedCollectionIfEmpty('ads', initialAds);
}

// --- Firestore CRUD wrappers with handleFirestoreError ---

export async function saveDocument(collectionPath: string, docId: string, data: any) {
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, data);
    console.log(`Successfully saved document ${docId} to ${collectionPath}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${docId}`);
  }
}

export async function removeDocument(collectionPath: string, docId: string) {
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
    console.log(`Successfully deleted document ${docId} from ${collectionPath}`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${docId}`);
  }
}

export async function fetchCollection<T>(collectionPath: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    const items: T[] = [];
    querySnapshot.forEach((docSnapshot) => {
      items.push({ ...docSnapshot.data() } as T);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionPath);
    return [];
  }
}
