/*
 * Chat implementation using Firebase Firestore.
 *
 * This script connects to two separate Firestore collections (`chat1` and
 * `chat2`), listens for real‑time updates and allows the current user
 * to send messages.  Messages include the user’s email (or the
 * literal string "Anonymous" if the user is not logged in) and a
 * timestamp, ensuring proper ordering.  When a new message is
 * submitted, the input box is cleared immediately.  Incoming
 * messages are rendered in the appropriate chat window.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Use the same Firebase configuration as in login.js.  Replace these
// placeholders with your real project configuration.
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
const db = getFirestore(app);

/**
 * Attach a listener to a Firestore collection and render incoming messages.
 *
 * @param {string} collectionName The name of the Firestore collection to listen on.
 * @param {HTMLElement} messagesDiv The DOM element where messages will be rendered.
 */
function listenForMessages(collectionName, messagesDiv) {
  const q = query(collection(db, collectionName), orderBy('createdAt'));
  onSnapshot(q, (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement('div');
      // Format: "user: message"
      div.textContent = `${msg.user || 'Anonymous'}: ${msg.text}`;
      messagesDiv.appendChild(div);
    });
    // Scroll to bottom of message list.
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

/**
 * Send a chat message to the specified Firestore collection.
 *
 * @param {string} collectionName The Firestore collection to write to ("chat1" or "chat2").
 * @param {string} message The message text.
 */
async function sendChatMessage(collectionName, message) {
  if (!message) return;
  const user = auth.currentUser;
  const userName = user?.email || 'Anonymous';
  try {
    await addDoc(collection(db, collectionName), {
      user: userName,
      text: message,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Failed to send message:', err);
  }
}

// When the DOM is ready, set up event listeners and Firestore listeners.
document.addEventListener('DOMContentLoaded', () => {
  // Message containers
  const chat1Messages = document.getElementById('chat1-messages');
  const chat2Messages = document.getElementById('chat2-messages');
  // Input fields
  const chat1Input = document.getElementById('chat1-input');
  const chat2Input = document.getElementById('chat2-input');
  // Send buttons
  const chat1Send = document.getElementById('chat1-send');
  const chat2Send = document.getElementById('chat2-send');

  // Listen for real‑time updates in both chat rooms.
  listenForMessages('chat1', chat1Messages);
  listenForMessages('chat2', chat2Messages);

  // Hook up send button handlers.
  chat1Send.addEventListener('click', () => {
    const text = chat1Input.value.trim();
    chat1Input.value = '';
    sendChatMessage('chat1', text);
  });
  chat2Send.addEventListener('click', () => {
    const text = chat2Input.value.trim();
    chat2Input.value = '';
    sendChatMessage('chat2', text);
  });

  // Optional: send messages on Enter key press in each input.
  chat1Input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      chat1Send.click();
    }
  });
  chat2Input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      chat2Send.click();
    }
  });
});