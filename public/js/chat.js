// Firestore chat (single source of truth). No main app changes.
import { auth, db } from "./firebase.js";
import {
  collection, addDoc, serverTimestamp,
  query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// DOM
const roomSel = document.getElementById('room');
const handle  = document.getElementById('handle');
const enter   = document.getElementById('enter');
const status  = document.getElementById('status');
const feed    = document.getElementById('feed');
const text    = document.getElementById('text');
const sendBtn = document.getElementById('send');

let room = roomSel?.value || 'lobby';
let displayName = '';
let unsub = null;

const fmt = (ts) => {
  const d = ts?.toDate ? ts.toDate() : (ts ? new Date(ts) : new Date());
  return d.toLocaleString();
};

function setStatus(msg){ if(status) status.textContent = msg; }

function clearFeed(){ if(feed) feed.innerHTML = ''; }

function appendMsg({ name, body, ts, mine }){
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `
    <div class="${mine?'me':'other'}"><strong>${name}</strong> â€” ${body}</div>
    <div class="meta">${fmt(ts)}</div>
  `;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
}

function listenRoom(r){
  if (unsub) { try { unsub(); } catch{}; unsub = null; }
  clearFeed();
  const qref = query(collection(db, 'rooms', r, 'messages'), orderBy('createdAt', 'asc'));
  unsub = onSnapshot(qref, (snap)=>{
    clearFeed();
    snap.forEach(doc=>{
      const d = doc.data();
      const mine = (auth.currentUser?.uid && d.uid === auth.currentUser.uid) ||
                   (displayName && d.displayName === displayName);
      appendMsg({ name: d.displayName || 'Member', body: d.text, ts: d.createdAt, mine });
    });
  });
}

async function send(){
  const v = text.value.trim();
  if (!v) return;
  text.value = '';
  const u = auth.currentUser;
  const name = u?.displayName || displayName || 'Member';
  try{
    await addDoc(collection(db, 'rooms', room, 'messages'), {
      text: v.slice(0,500),
      uid: u?.uid || null,
      displayName: name,
      createdAt: serverTimestamp(),
    });
  } catch (e){
    // If rules block unauthenticated writes
    setStatus(e?.message || 'Could not send. Sign in required.');
  }
}

enter?.addEventListener('click', ()=>{
  displayName = (handle?.value || '').trim();
  const signed = !!auth.currentUser;
  if (!signed && !displayName){ alert('Enter a name or sign in.'); return; }
  text.disabled = false;
  sendBtn.disabled = false;
  setStatus(`Connected as ${auth.currentUser?.displayName || displayName}`);
  listenRoom(roomSel?.value || 'lobby');
});

roomSel?.addEventListener('change', (e)=>{
  room = e?.target?.value || 'lobby';
  if (!text.disabled) listenRoom(room);
});

sendBtn?.addEventListener('click', send);
text?.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') send(); });

onAuthStateChanged(auth, (u)=>{
  // If user signs in elsewhere, prefer their displayName
  if (u && !displayName && u.displayName){
    displayName = u.displayName;
    if (!text.disabled) setStatus(`Connected as ${displayName}`);
  }
});
