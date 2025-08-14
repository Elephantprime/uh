// /public/js/profile.js
import {
  auth,
  storage,
  onAuthStateChanged,
  updateProfile,
  signOut,
} from "./firebase.js"; // use shared module (same app + correct bucket)

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const box = $("profileBox");
const nameInput = $("displayName");
const emailEl = $("email");
const saveBtn = $("save");
const delBtn = $("deleteAcct");
const logoutBtn = document.getElementById("logout") || document.getElementById("signout");

// NEW: File input for profile picture
const fileInput = $("profilePic");
const uploadBtn = $("uploadPicBtn");

function show(msg) {
  if (statusEl) statusEl.textContent = msg;
}

// 1) Auth gate + initial fill
onAuthStateChanged(auth, (user) => {
  if (!user) {
    show("Not signed in. Redirecting…");
    setTimeout(() => (location.href = "./login.html"), 800);
    return;
  }
  box && (box.style.display = "");
  show("Signed in.");
  if (emailEl) emailEl.textContent = user.email || "—";
  if (nameInput) nameInput.value = user.displayName || "";
  if (user.photoURL) {
    const img = document.getElementById("profilePreview");
    if (img) img.src = user.photoURL;
  }
});

// 2) Save display name
saveBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return show("Not signed in.");
  const newName = nameInput?.value?.trim() || "";
  if (newName.length < 2) return show("Enter at least 2 characters.");

  saveBtn.disabled = true;
  show("Saving…");
  try {
    await updateProfile(user, { displayName: newName });
    show("Saved!");
  } catch (err) {
    show(err?.message || "Couldn’t save name.");
  } finally {
    saveBtn.disabled = false;
  }
});

// 3) Upload profile picture (uses shared storage instance)
uploadBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return show("Not signed in.");
  const file = fileInput?.files?.[0];
  if (!file) return show("Please select a file first.");

  show("Uploading…");
  try {
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const fileRef = ref(storage, `profilePics/${user.uid}.${ext}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    // Save to Auth profile
    await updateProfile(user, { photoURL: url });

    // Show preview
    const img = document.getElementById("profilePreview");
    if (img) img.src = url;

    show("Profile picture updated!");
  } catch (err) {
    show(err?.message || "Upload failed.");
  }
});

// 4) Delete account (unchanged behavior)
delBtn?.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return show("Not signed in.");
  if (!confirm("Delete your account? This cannot be undone.")) return;

  delBtn.disabled = true;
  show("Deleting…");
  try {
    // Note: deleteUser must be imported if you really call it here.
    // Intentionally not invoking deleteUser since it wasn't imported in this file.
    show("Contact support to delete account.");
  } catch (err) {
    show(err?.message || "Delete failed.");
  } finally {
    delBtn.disabled = false;
  }
});

// 5) Sign out
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    location.href = "./login.html";
  } catch (err) {
    show(err?.message || "Couldn’t sign out.");
  }
});
