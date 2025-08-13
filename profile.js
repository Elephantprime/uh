// public/js/profile.js
import { auth } from "/public/js/firebase.js";
import {
  onAuthStateChanged,
  signOut,
  updateProfile,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const $ = (id)=>document.getElementById(id);
const statusEl = $("status"), nameEl = $("displayName"), emailEl = $("email");

function msg(t, ok=false){ if(statusEl){ statusEl.textContent=t; statusEl.className = ok ? "ok" : "warn"; } }

onAuthStateChanged(auth, (u)=>{
  if(!u){
    // not signed in → send to auth page
    location.replace("/auth.html");
    return;
  }
  statusEl.className="muted";
  statusEl.textContent="Signed in.";
  emailEl.textContent = u.email || "—";
  nameEl.value = u.displayName || "";
});

$("signOut")?.addEventListener("click", async ()=>{
  await signOut(auth);
  location.replace("/auth.html");
});

$("save")?.addEventListener("click", async ()=>{
  const u = auth.currentUser;
  if(!u) return;
  try{
    await updateProfile(u, { displayName: nameEl.value.trim() });
    msg("Saved.", true);
  }catch(e){ msg("Couldn’t save."); }
});

$("deleteAcct")?.addEventListener("click", async ()=>{
  const u = auth.currentUser;
  if(!u) return;
  if(!confirm("Delete your account? This cannot be undone.")) return;
  try{
    await deleteUser(u);
    location.replace("/auth.html");
  }catch(e){ msg("Couldn’t delete (re-auth may be required)."); }
});
