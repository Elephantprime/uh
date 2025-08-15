// ./js/login.js
import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// optional: small helper for UI
const $ = (id) => document.getElementById(id);
const statusEl = $("login-status"); // <div id="login-status"></div> (optional)

function setStatus(msg) { if (statusEl) statusEl.textContent = msg; }

async function saveProfile(user) {
  // keep a minimal profile doc up to date
  try {
    await setDoc(doc(db, "profiles", user.uid), {
      uid: user.uid,
      displayName: user.displayName || "Member",
      photoURL: user.photoURL || null,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    // non-fatal for login
    console.warn("saveProfile failed:", e);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = ($("login-email")?.value || "").trim();
  const pass  = ($("login-password")?.value || "").trim();
  if (!email || !pass) { setStatus("Enter email and password."); return; }

  const btn = e.submitter || $("login-submit");
  if (btn) { btn.disabled = true; btn.textContent = "Signing in…"; }
  setStatus("Signing in…");

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const user = cred.user;
    await saveProfile(user);
    // go to the signed-in user's profile page
    location.replace("./profile.html");
  } catch (err) {
    console.error(err);
    setStatus(err?.message || "Login failed.");
    if (!statusEl) alert(err?.message || "Login failed.");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "Login"; }
  }
}

// attach once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const form = $("login-form");
  if (form) form.addEventListener("submit", handleLogin);

  // If already signed in, bounce to profile immediately
  onAuthStateChanged(auth, (user) => {
    if (user) location.replace("./profile.html");
  });
});
