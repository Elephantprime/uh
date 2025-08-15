/*
 * This module handles user sign‑up and login against Firebase.
 *
 * On sign‑up, it uploads the selected profile picture to Firebase
 * Storage under `profilePictures/{uid}/{filename}` and stores the
 * resulting public URL along with the user’s email in a Firestore
 * document keyed by the user’s UID.  On successful sign‑up the user
 * remains signed in, but the UI simply displays an alert prompting
 * the user to proceed to the login form.  You could extend this
 * workflow to automatically redirect to the chat page instead.
 *
 * The login form signs the user in with email and password.  On
 * success the browser navigates to `chat.html` located in the same
 * directory.  Errors are reported via `alert()`.
 *
 * NOTE: Replace the placeholder values in the `firebaseConfig` object
 * with your own Firebase project’s configuration.  You can find
 * these values in the Firebase console under project settings.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';
import {
  getFirestore,
  doc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// TODO: Replace the following configuration with your own Firebase project settings.
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  appId: 'YOUR_APP_ID',
};

// Initialize Firebase services.
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

/**
 * Handle the sign‑up form submission.
 */
async function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const fileInput = document.getElementById('profile-picture');
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a profile picture.');
    return;
  }
  try {
    // Create the user with email and password.
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;
    // Upload the profile picture to a dedicated folder.
    const filePath = `profilePictures/${user.uid}/${file.name}`;
    const picRef = storageRef(storage, filePath);
    await uploadBytes(picRef, file);
    // Obtain a public download URL.
    const photoURL = await getDownloadURL(picRef);
    // Update the user’s profile with the photo URL.
    await updateProfile(user, { photoURL });
    // Persist basic user details to Firestore.
    await setDoc(doc(db, 'users', user.uid), {
      email,
      photoURL,
    });
    alert('Sign up successful. You can now log in.');
    // Optionally, you could redirect immediately: window.location.href = 'chat.html';
  } catch (err) {
    console.error(err);
    alert(`Sign‑up failed: ${err.message}`);
  }
}

/**
 * Handle the login form submission.
 */
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect to chat page on success.
    window.location.href = 'chat.html';
  } catch (err) {
    console.error(err);
    alert(`Login failed: ${err.message}`);
  }
}

// Register event listeners once the DOM has loaded.
document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  signupForm?.addEventListener('submit', handleSignup);
  loginForm?.addEventListener('submit', handleLogin);
});