import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnB1omBJJW4EfuTdM11zhFOadmFKGrVaw",
  authDomain: "react-challenge-journal.firebaseapp.com",
  projectId: "react-challenge-journal",
  storageBucket: "react-challenge-journal.firebasestorage.app",
  messagingSenderId: "765314121888",
  appId: "1:765314121888:web:aa099b7260de59864209c5",
  measurementId: "G-LXKYRK6P2S",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

let db;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
    }),
  });
} catch {
  db = getFirestore(app);
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("Firestore persistence:", err?.code || err);
  });
}

export { db };
