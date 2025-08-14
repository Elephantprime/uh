// public/js/firebase.js  
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";  
import {  
  getAuth,  
  onAuthStateChanged,  
  signOut,  
  updateProfile,  
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";  
import {  
  getAnalytics,  
  isSupported as analyticsIsSupported,  
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";  
import {  
  getFirestore,  
  collection,  
  doc,  
  addDoc,  
  setDoc,  
  getDoc,  
  getDocs,  
  updateDoc,  
  deleteDoc,  
  query,  
  where,  
  orderBy,  
  limit,  
  onSnapshot,  
  serverTimestamp,  
  Timestamp,  
  enableIndexedDbPersistence,  
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";  
import {  
  getStorage,  
  ref,  
  uploadBytes,  
  getDownloadURL,  
  deleteObject,  
  listAll,  
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";  
  
const firebaseConfig = {  
  apiKey: "AIzaSyC4K7iCqvxTo6Gj5oIPsErF_vMDlhi0znE",  
  authDomain: "unhinged-8c6da.firebaseapp.com",  
  projectId: "unhinged-8c6da",  
  storageBucket: "unhinged-8c6da.appspot.com",  
  messagingSenderId: "248472796860",  
  appId: "1:248472796860:web:1d7488b03935ae64f5dab9",  
  measurementId: "G-QEEY24M17T",  
};  
  
// Initialize core SDKs  
const app = initializeApp(firebaseConfig);  
const auth = getAuth(app);  
const db = getFirestore(app);  
const storage = getStorage(app);  
  
// Enable offline persistence for Firestore  
enableIndexedDbPersistence(db).catch(() => {});  
  
// Analytics (only if supported)  
analyticsIsSupported().then((ok) => {  
  if (ok) getAnalytics(app);  
});  
  
// Get current user once as a Promise  
const currentUserOnce = () =>  
  new Promise((resolve) => {  
    const unsub = onAuthStateChanged(auth, (u) => {  
      unsub();  
      resolve(u);  
    });  
  });  
  
// ===== Exports =====  
export { app, auth, db, storage };  
export { onAuthStateChanged, signOut, updateProfile, currentUserOnce };  
export {  
  collection,  
  doc,  
  addDoc,  
  setDoc,  
  getDoc,  
  getDocs,  
  updateDoc,  
  deleteDoc,  
  query,  
  where,  
  orderBy,  
  limit,  
  onSnapshot,  
  serverTimestamp,  
  Timestamp,  
};  
export { ref, uploadBytes, getDownloadURL, deleteObject, listAll };
