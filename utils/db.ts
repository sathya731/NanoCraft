import { CraftedElement } from '../types';

const DB_NAME = 'NanoCraftDB';
const STORE_NAME = 'discoveredElements';
let db: IDBDatabase;

export const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) return resolve(true);

    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => {
      console.error('Error opening IndexedDB');
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveElementToDB = (element: CraftedElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!db) {
        return reject(new Error("DB not initialized"));
    }
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(element);
    request.onsuccess = () => resolve();
    request.onerror = () => {
        console.error('Failed to save element to DB', request.error);
        reject();
    }
  });
};

export const getAllElementsFromDB = (): Promise<CraftedElement[]> => {
  return new Promise((resolve, reject) => {
     if (!db) {
        return reject(new Error("DB not initialized"));
    }
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
        console.error('Failed to get elements from DB', request.error);
        reject();
    }
  });
};

export const clearAllElementsFromDB = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject(new Error("DB not initialized"));
        }
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Failed to clear DB', request.error);
            reject();
        }
    });
}
