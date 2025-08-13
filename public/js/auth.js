// /public/js/auth.js

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { auth } from "./firebase.js";

// ---- Debug helpers (so we SEE what's happening) ----
function log(...a){ try{ console.log("[auth]", ...a);}catch{} }
window.addEventListener("error", (e)=>{
  console.error("[auth] Uncaught error:", e?.error || e?.message || e);
});
log("auth.js loaded");

// ---- Grab elements (must match login.html) ----
const emailEl  = document.getElementById("email");
const passEl   = document.getElementById("password");
const statusEl = document.getElementById("status");

const signinBtn = document.getElementById("signin");
const createBtn = document.getElementById("create");
const forgotBtn = document.getElementById("forgot");

function msg(t, ok=false){
  if (!statusEl) return;
  statusEl.textContent = t || "";
  statusEl.className = ok ? "ok" : "warn";
}

// ---- Actions ----
async function doSignIn(){
  try{
    msg("Signing in…");
    const em = (emailEl?.value || "").trim();
    const pw = passEl?.value || "";
    log("signIn attempt with:", em ? "email set" : "NO EMAIL", pw ? "pw set" : "NO PW");

    const cred = await signInWithEmailAndPassword(auth, em, pw);
    log("signIn success:", cred?.user?.uid);
    msg("Signed in!", true);
    // go to your app’s home
    location.replace("./index.html");
  }catch(err){
    const m = err?.message || String(err);
    log("signIn error:", err);
    msg(m);
    alert("Sign-in error: " + m);
  }
}

async function doCreate(){
  try{
    msg("Creating account…");
    const em = (emailEl?.value || "").trim();
    const pw = passEl?.value || "";
    log("create attempt:", em ? "email set" : "NO EMAIL", pw ? "pw set" : "NO PW");

    const cred = await createUserWithEmailAndPassword(auth, em, pw);
    log("create success:", cred?.user?.uid);
    msg("Account created!", true);
    location.replace("./index.html");
  }catch(err){
    const m = err?.message || String(err);
    log("create error:", err);
    msg(m);
    alert("Create error: " + m);
  }
}

async function doForgot(){
  try{
    const em = (emailEl?.value || "").trim();
    if(!em){ msg("Enter your email first"); return; }
    log("reset attempt for:", em);
    await sendPasswordResetEmail(auth, em);
    msg("Reset email sent", true);
  }catch(err){
    const m = err?.message || String(err);
    log("reset error:", err);
    msg(m);
    alert("Reset error: " + m);
  }
}

// ---- Wire up (robust) ----
function wire(){
  if(!emailEl || !passEl || !signinBtn){
    log("Expected login elements not found on this page.");
    return;
  }
  signinBtn.addEventListener("click", doSignIn);
  createBtn?.addEventListener("click", doCreate);
  forgotBtn?.addEventListener("click", doForgot);

  // Enter key submits
  [emailEl, passEl].forEach(el=>{
    el?.addEventListener("keydown", (e)=>{
      if(e.key === "Enter") doSignIn();
    });
  });

  log("event listeners attached");
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wire);
} else {
  wire();
}
