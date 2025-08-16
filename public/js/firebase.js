// public/js/firebase.js
// =====================================================
// Firebase bootstrap + production-safe helpers (no TODOs).
// Includes:
//  - Correct bucket name
//  - ensureUserDoc() to guarantee users/{uid}
//  - uploadUserPhoto() + setPrimaryPhoto()
//  - saveProfileFields() (keeps server-managed fields intact)
//  - getUserDoc() convenience
//  - waitForAuth() promise wrapper for onAuthStateChanged
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getStorage, ref as sRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// ===== Config (live project) =====
const firebaseConfig = {
  apiKey: "AIzaSyDHqhU5fDxG-GW2hfUVrcHCCxBzPdHd5-M",
  authDomain: "unhinged-8c6da.firebaseapp.com",
  projectId: "unhinged-8c6da",
  storageBucket: "unhinged-8c6da.appspot.com", // <-- fixed
  messagingSenderId: "248472796860",
  appId: "1:248472796860:web:9d8d043e7fb051acf5dab9",
  measurementId: "G-6BC5YCV33Q",
};

// ===== Core singletons =====
const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// =====================================================
// Helpers
// =====================================================

// Promise wrapper: resolves with user (or null) once, no subscriptions left open.
function waitForAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u || null); });
  });
}

// Quick ref for a user's profile document
function userRef(uid) { return doc(db, "users", uid); }

// Read a users/{uid} doc (returns null if missing)
async function getUserDoc(uid) {
  const snap = await getDoc(userRef(uid));
  return snap.exists() ? snap.data() : null;
}

// Ensure a users/{uid} doc exists (call after signup OR first login)
async function ensureUserDoc(user) {
  if (!user?.uid) return null;
  const uref = userRef(user.uid);
  const snap = await getDoc(uref);
  if (!snap.exists()) {
    const seed = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "Member",
      username: "",
      gender: "",
      hobbies: "",
      interests: "",
      photoURL: user.photoURL || "",
      photos: user.photoURL ? [user.photoURL] : [],
      bio: "",
      age: null,
      location: "",
      badges: [],
      flags: [],
      membership: { tier: "free" },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(uref, seed);
    return seed;
  }
  return snap.data();
}

// Upload a photo to Storage and return its download URL
async function uploadUserPhoto(uid, file) {
  const safeName = (file?.name || "photo").replace(/[^\w.\-]+/g, "_");
  const path = `avatars/${uid}/${Date.now()}_${safeName}`;
  const ref = sRef(storage, path);
  await uploadBytes(ref, file);
  return await getDownloadURL(ref);
}

// Set a given photo URL as the user's primary (Auth + Firestore)
async function setPrimaryPhoto(uid, photoUrl, currentDoc, currentUser) {
  try { if (currentUser) await updateProfile(currentUser, { photoURL: photoUrl }); }
  catch (_) { /* non-fatal if Auth update fails */ }

  const photos = Array.isArray(currentDoc?.photos) ? [...currentDoc.photos] : [];
  const idx = photos.indexOf(photoUrl);
  if (idx > 0) { photos.splice(idx, 1); photos.unshift(photoUrl); }
  else if (idx < 0) { photos.unshift(photoUrl); }

  await setDoc(userRef(uid), {
    photoURL: photoUrl,
    photos,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return { photoURL: photoUrl, photos };
}

// Upsert editable fields only (server-managed fields remain unchanged by rules)
async function saveProfileFields(uid, fields) {
  const safe = {
    displayName: fields.displayName ?? null,
    username: fields.username ?? null,
    gender: fields.gender ?? null,
    hobbies: fields.hobbies ?? null,
    interests: fields.interests ?? null,
    bio: fields.bio ?? null,
    age: (typeof fields.age === "number" || fields.age === null) ? fields.age : null,
    location: fields.location ?? null,
    updatedAt: serverTimestamp(),
  };
  await setDoc(userRef(uid), safe, { merge: true });
  return true;
}

// =====================================================
// Exports
// =====================================================
export {
  // Core
  app, auth, db, storage,
  // Firebase primitives you may want
  doc, getDoc, setDoc, serverTimestamp,
  sRef, uploadBytes, getDownloadURL, updateProfile,
  // App helpers
  waitForAuth, userRef, getUserDoc, ensureUserDoc,
  uploadUserPhoto, setPrimaryPhoto, saveProfileFields
};
```0
