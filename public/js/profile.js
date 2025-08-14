// Profile: name/bio/avatar -> Auth + Firestore + Storage
import { auth, db, storage } from "./firebase.js";
import {
  onAuthStateChanged, updateProfile, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  ref as sRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const $ = (id) => document.getElementById(id);
const nameInput = $('name');
const bioInput  = $('bio');
const fileInput = $('avatar');
const preview   = $('preview');
const saveBtn   = $('save');
const delBtn    = $('deletePhoto');
const statusEl  = $('status');

function show(msg){ if(statusEl) statusEl.textContent = msg || ''; }

let me = null;
let currentPhotoURL = '';

// --- Auth state & prefill ---
onAuthStateChanged(auth, async (user)=>{
  me = user || null;
  if (!me){
    location.href = './login.html';
    return;
  }

  // Load instantly from Auth (cached)
  nameInput.value = me.displayName || '';
  currentPhotoURL = me.photoURL || '';
  if (currentPhotoURL){
    preview.src = currentPhotoURL;
    preview.style.display = 'block';
  }

  // Then load from Firestore for any missing data
  try {
    const uref = doc(db, 'users', me.uid);
    const snap = await getDoc(uref);
    if (snap.exists()){
      const d = snap.data();
      if (d?.bio) bioInput.value = d.bio;
      if (!currentPhotoURL && d?.photoURL){
        preview.src = d.photoURL;
        preview.style.display = 'block';
        currentPhotoURL = d.photoURL;
      }
    }
  } catch (e) {
    console.error("Profile load error:", e);
  }
});

// --- Live preview on file select ---
fileInput?.addEventListener('change', ()=>{
  const f = fileInput.files?.[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  preview.src = url;
  preview.style.display = 'block';
});

// --- Save profile ---
saveBtn?.addEventListener('click', async ()=>{
  if (!me){ show('Sign in first.'); return; }

  const displayName = (nameInput.value || '').trim().slice(0,60);
  const bio = (bioInput.value || '').trim().slice(0,400);
  const file = fileInput.files?.[0];

  saveBtn.disabled = true;
  show('Saving…');

  try {
    let photoURL = currentPhotoURL;

    if (file){
      const path = `avatars/${me.uid}/${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
      const r = sRef(storage, path);
      await uploadBytes(r, file);
      photoURL = await getDownloadURL(r);

      // Update preview instantly with new URL
      preview.src = photoURL;
      preview.style.display = 'block';
    }

    // Update Auth profile (cached)
    await updateProfile(me, {
      displayName: displayName || me.displayName || 'Member',
      photoURL: photoURL || null
    });

    // Save to Firestore
    const uref = doc(db, 'users', me.uid);
    await setDoc(uref, {
      uid: me.uid,
      displayName: displayName || me.displayName || 'Member',
      photoURL: photoURL || null,
      bio,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    currentPhotoURL = photoURL || currentPhotoURL;
    show('Profile saved!');
    setTimeout(()=> show(''), 1500);

  } catch (err){
    console.error(err);
    show(err?.message || 'Failed saving profile.');
  } finally {
    saveBtn.disabled = false;
  }
});

// --- Delete preview (not deleting from Storage) ---
delBtn?.addEventListener('click', ()=>{
  preview.removeAttribute('src');
  preview.style.display = 'none';
  fileInput.value = '';
});

// --- Optional logout ---
document.getElementById('logout')?.addEventListener('click', async ()=>{
  try { 
    await signOut(auth); 
    location.href = './login.html'; 
  } catch (e){ 
    show(e?.message || 'Could not sign out.'); 
  }
});
