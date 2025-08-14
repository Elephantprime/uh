// /public/js/auth.js
import { auth } from './firebase.js';

  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// Helper
const $ = (id) => document.getElementById(id);

window.addEventListener('DOMContentLoaded', () => {
  const email   = $('email');
  const pass    = $('password');
  const signin  = $('signin');
  const create  = $('create');
  const forgot  = $('forgot');
  const status  = $('status');

  // SAFETY: no onAuthStateChanged redirect here.
  // We let the user stay on /login.html until they choose an action.

  if (signin) {
    signin.addEventListener('click', async () => {
      status.textContent = 'Signing in…';
      try {
        const em = (email?.value || '').trim();
        const pw = pass?.value || '';
        await signInWithEmailAndPassword(auth, em, pw);

        // where to go after sign-in:
        // change to your “member app” entry if needed (e.g. './app.html' or './profile.html')
        location.replace('./profile.html');
      } catch (err) {
        console.error(err);
        status.textContent = err?.message || 'Could not sign in';
      }
    });
  }

  if (create) {
    create.addEventListener('click', () => {
      // go to your dedicated signup screen
      location.href = './signup.html';
    });
  }

  if (forgot) {
    forgot.addEventListener('click', async () => {
      const em = (email?.value || '').trim();
      if (!em) {
        status.textContent = 'Enter your email first';
        return;
      }
      status.textContent = 'Sending reset email…';
      try {
        await sendPasswordResetEmail(auth, em);
        status.textContent = 'Password reset sent. Check your inbox.';
      } catch (err) {
        console.error(err);
        status.textContent = err?.message || 'Could not send reset email';
      }
    });
  }
});
