<script type="module">
// Firebase v10.12.2 (matches your repo)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== Your Firebase project credentials (from screenshot) =====
const firebaseConfig = {
  apiKey: "AIzaSyC4K7iCqvxTo6Gj5oIPsErF_vMDIh0znE",
  authDomain: "unhinged-8c6da.firebaseapp.com",
  projectId: "unhinged-8c6da",
  storageBucket: "unhinged-8c6da.appspot.com",
  messagingSenderId: "248472796860",
  appId: "1:248472796860:web:1d7488b03935ae645dab9",
  measurementId: "G-QEEY24M17T",
};

// ===== Initialize =====
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// ===== Helpers =====
function $(id){ return document.getElementById(id); }
function busy(btn, isBusy){
  if (!btn) return;
  btn.disabled = !!isBusy;
  if (btn.dataset.label === undefined) btn.dataset.label = btn.textContent || "Submit";
  btn.textContent = isBusy ? "Working…" : btn.dataset.label;
}
function toast(msg){ alert(msg); }

// ===== Sign up with photo, save profile =====
async function handleSignup(e){
  e?.preventDefault?.();
  const email = $("signup-email")?.value?.trim() || "";
  const password = $("signup-password")?.value || "";
  const file = $("profile-picture")?.files?.[0];

  if (!email || !password) return toast("Enter email and password.");
  if (!file) return toast("Please select a profile picture.");

  busy($("signup-submit"), true);
  try {
    // Create user
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    // Upload photo -> get URL
    const path = `profilePictures/${user.uid}/${file.name}`;
    const ref = storageRef(storage, path);
    await uploadBytes(ref, file);
    const photoURL = await getDownloadURL(ref);

    // Update Auth profile
    await updateProfile(user, { photoURL });

    // Save to Firestore (users & profiles—use either; keeping both for compatibility)
    const data = {
      uid: user.uid,
      email,
      photoURL,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };
    await Promise.all([
      setDoc(doc(db, "users", user.uid), data, { merge: true }),
      setDoc(doc(db, "profiles", user.uid), data, { merge: true }),
    ]);

    toast("Sign up successful. Redirecting to chat…");
    location.href = "chat.html";
  } catch (err) {
    console.error(err);
    toast(`Sign‑up failed: ${err.message}`);
  } finally {
    busy($("signup-submit"), false);
  }
}

// ===== Login, then go to chat =====
async function handleLogin(e){
  e?.preventDefault?.();
  const email = $("login-email")?.value?.trim() || "";
  const password = $("login-password")?.value || "";
  if (!email || !password) return toast("Enter email and password.");

  busy($("login-submit"), true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "chat.html";
  } catch (err) {
    console.error(err);
    toast(`Login failed: ${err.message}`);
  } finally {
    busy($("login-submit"), false);
  }
}

// ===== Wire up forms when DOM is ready =====
document.addEventListener("DOMContentLoaded", () => {
  $("signup-form")?.addEventListener("submit", handleSignup);
  $("login-form")?.addEventListener("submit", handleLogin);

  // Optional: button IDs for nicer busy state
  $("signup-submit") ??= $("signup-form")?.querySelector("button[type=submit]");
  $("login-submit") ??= $("login-form")?.querySelector("button[type=submit]");
});
</script>
