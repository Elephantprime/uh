// public/js/profile.js
import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  updateProfile,
  signOut,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Elements (must match profile.html)
const $ = (id) => document.getElementById(id);
const statusEl   = $("status");
const boxEl      = $("profileBox");
const nameInput  = $("displayName");
const emailOut   = $("email");
const saveBtn    = $("save");
const delBtn     = $("deleteAcct");
const logoutBtn  = $("logout");

// Simple status helper
function msg(text = "", ok = false) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.className = ok ? "ok" : "warn";
}
function showBox(show) {
  if (boxEl) boxEl.style.display = show ? "block" : "none";
}

// Auth state: populate fields; NO nav/button injection here
let first = true;
onAuthStateChanged(auth, (u) => {
  if (u) {
    showBox(true);
    if (emailOut) emailOut.textContent = u.email || "—";
    if (nameInput) nameInput.value = u.displayName || "";
    msg("", true);
  } else if (!first) {
    msg("You’re signed out.", false);
  }
  first = false;
});

// Save display name -> go to main app
saveBtn?.addEventListener("click", async () => {
  const u = auth.currentUser;
  if (!u) { msg("You’re signed out. Log in again.", false); return; }
  const name = (nameInput?.value || "").trim();
  if (!name) { msg("Enter a display name.", false); return; }
  try {
    await updateProfile(u, { displayName: name });
    msg("Saved.", true);
    location.replace("./index.html");
  } catch (e) {
    msg(e?.message || "Couldn't save.", false);
  }
});

// Delete account -> back to login
delBtn?.addEventListener("click", async () => {
  const u = auth.currentUser;
  if (!u) return;
  if (!confirm("Delete your account? This cannot be undone.")) return;
  try {
    await deleteUser(u);
    msg("Account deleted.", true);
    location.replace("./login.html");
  } catch (e) {
    msg(e?.message || "Couldn't delete account.", false);
  }
});

// Log out -> back to login
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    location.replace("./login.html");
  } catch (e) {
    msg(e?.message || "Couldn't sign out.", false);
  }
});
