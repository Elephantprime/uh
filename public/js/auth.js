// /public/js/auth.js
import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// Helper
const $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
  const email  = $('email');
  const pass   = $('password');
  const signin = $('signin');
  const create = $('create');
  const forgot = $('forgot');
  const status = $('status');

  // Sign in
  signin?.addEventListener('click', async () => {
    status && (status.textContent = 'Signing in…');
    try {
      const em = (email?.value || '').trim();
      const pw = pass?.value || '';
      await signInWithEmailAndPassword(auth, em, pw);
      // Go to the main app after sign-in
      location.replace('./app.html');
    } catch (err) {
      console.error(err);
      if (status) status.textContent = err?.message || 'Could not sign in';
    }
  });

  // Go to signup screen
  create?.addEventListener('click', () => {
    location.href = './signup.html';
  });

  // Password reset
  forgot?.addEventListener('click', async () => {
    const em = (email?.value || '').trim();
    if (!em) {
      if (status) status.textContent = 'Enter your email first';
      return;
    }
    status && (status.textContent = 'Sending reset email…');
    try {
      await sendPasswordResetEmail(auth, em);
      if (status) status.textContent = 'Password reset sent. Check your inbox.';
    } catch (err) {
      console.error(err);
      if (status) status.textContent = err?.message || 'Could not send
