import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  deleteDoc 
};

// Safe Firestore Wrapper with fallback to LocalStorage for offline/demo resilience
export async function saveDocument<T extends { id: string }>(collectionName: string, item: T): Promise<void> {
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    console.warn(`Firestore write to ${collectionName} failed; writing to local cache:`, error);
  } finally {
    // Always persist to local cache as reliable fallback
    const localKey = `societyprime_${collectionName}`;
    const existingStr = localStorage.getItem(localKey);
    let items: T[] = existingStr ? JSON.parse(existingStr) : [];
    const index = items.findIndex(x => x.id === item.id);
    if (index >= 0) {
      items[index] = { ...items[index], ...item };
    } else {
      items.push(item);
    }
    localStorage.setItem(localKey, JSON.stringify(items));
  }
}

export async function fetchCollection<T>(collectionName: string, defaultData: T[]): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      return snapshot.docs.map(d => d.data() as T);
    }
  } catch (error) {
    console.warn(`Firestore read from ${collectionName} failed; falling back to local:`, error);
  }
  
  // Read local cache
  const localKey = `societyprime_${collectionName}`;
  const localStr = localStorage.getItem(localKey);
  if (localStr) {
    try {
      const parsed = JSON.parse(localStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // ignore
    }
  }
  
  // Initialize with default seed data
  if (defaultData && defaultData.length > 0) {
    localStorage.setItem(localKey, JSON.stringify(defaultData));
    // Attempt async seed to Firestore
    try {
      defaultData.forEach(async (item: any) => {
        if (item.id) {
          const docRef = doc(db, collectionName, item.id);
          await setDoc(docRef, item, { merge: true });
        }
      });
    } catch (e) {
      console.warn("Background seed notice:", e);
    }
  }
  return defaultData;
}
