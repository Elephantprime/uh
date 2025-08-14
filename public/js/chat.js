// /public/js/chat.js — Firestore-backed chat with local fallback

// DOM
const roomSel = document.getElementById('room');
const handle  = document.getElementById('handle');
const enter   = document.getElementById('enter');
const status  = document.getElementById('status');
const feed    = document.getElementById('feed');
const text    = document.getElementById('text');
const sendBtn = document.getElementById('send');

let room = roomSel?.value || 'lobby';
let name = '';

const timeFmt = (ts) => {
  if (!ts) return '';
  // ts can be a Firestore Timestamp or a JS Date/number (fallback)
  const d = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

function renderMessage(m, mine=false){
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `
    <div class="${mine?'me':'other'}"><strong>${m.displayName || m.user || 'Member'}</strong> — ${m.text}</div>
    <div class="meta">${timeFmt(m.createdAt || m.ts)}</div>
  `;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
}

function setLiveUI(enabled){
  if (text) text.disabled = !enabled;
  if (sendBtn) sendBtn.disabled = !enabled;
}

/* ===========
   Try Firebase
   =========== */
let usingFirebase = false;
let fb = null;     // will hold imported firebase helpers
let unsub = null;  // messages listener

(async () => {
  try {
    // Import from your shared firebase.js (same app instance everywhere)
    fb = await import('./firebase.js'); // exports: db, auth, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, etc.
    if (fb?.db) usingFirebase = true;
  } catch (_) {
    usingFirebase = false;
  }

  if (usingFirebase) {
    await wireFirebase();
  } else {
    wireLocalFallback();
  }
})();

async function wireFirebase(){
  async function joinFirebase(newRoom){
    if (unsub) { unsub(); unsub = null; }
    room = newRoom;
    feed.innerHTML = '';

    const roomRef = fb.collection(fb.db, 'rooms', room, 'messages');
    const qMsgs   = fb.query(roomRef, fb.orderBy('createdAt','asc'));

    unsub = fb.onSnapshot(qMsgs, (snap)=>{
      feed.innerHTML = '';
      snap.forEach(doc => {
        const d = doc.data();
        renderMessage(d, d.uid === fb.auth.currentUser?.uid || d.displayName === name);
      });
    });
  }

  async function sendFirebase(){
    const val = text.value.trim();
    if (!val) return;
    text.value = '';

    // If not authed, synthesize a temporary displayName from handle,
    // but still write as anonymous (no uid). If user is logged in, use uid/displayName.
    const u = fb.auth.currentUser;
    const displayName = u?.displayName || name || 'Member';

    const roomRef = fb.collection(fb.db, 'rooms', room, 'messages');
    await fb.addDoc(roomRef, {
      text: val.slice(0, 500),
      uid: u?.uid || null,
      displayName,
      createdAt: fb.serverTimestamp(),
    });
  }

  // Wire UI
  enter?.addEventListener('click', async ()=>{
    name = (handle?.value || '').trim();
    if (!name && !fb.auth.currentUser) { alert('Enter your name.'); return; }
    status && (status.textContent = `Connected as ${fb.auth.currentUser?.displayName || name || 'Member'}`);
    setLiveUI(true);
    await joinFirebase(roomSel?.value || 'lobby');
  });

  roomSel?.addEventListener('change', async e=>{
    if (!e?.target) return;
    const newRoom = e.target.value;
    if (!name && !fb.auth.currentUser) { room = newRoom; return; }
    await joinFirebase(newRoom);
  });

  sendBtn?.addEventListener('click', sendFirebase);
  text?.addEventListener('keydown', e=>{ if(e.key==='Enter') sendFirebase(); });

  console.log('[Chat] Using Firestore backend');
}

/* =========================
   Local fallback (BroadcastChannel)
   ========================= */
function wireLocalFallback(){
  const chan = new BroadcastChannel('unhinged_chat');

  function key(r){ return `uh_chat_${r}`; }
  function load(r){ return JSON.parse(localStorage.getItem(key(r)) || '[]'); }
  function save(r, arr){ localStorage.setItem(key(r), JSON.stringify(arr)); }

  function renderRoom(r){
    feed.innerHTML = '';
    load(r).slice(-200).forEach(m=>{
      renderMessage(m, m.displayName === name || m.user === name);
    });
  }

  function postLocal(textVal){
    const msg = { user: name || 'Member', displayName: name || 'Member', text: textVal.slice(0, 500), createdAt: Date.now(), room };
    const arr = load(room); arr.push(msg); save(room, arr);
    renderRoom(room);
    chan.postMessage({ type: 'new', room });
  }

  enter?.addEventListener('click', ()=>{
    name = (handle?.value || '').trim();
    if (!name) { alert('Enter your name.'); return; }
    status && (status.textContent = `Connected as ${name}`);
    setLiveUI(true);
    renderRoom(roomSel?.value || 'lobby');
  });

  roomSel?.addEventListener('change', e=>{
    room = e?.target?.value || 'lobby';
    if (!name) return;
    renderRoom(room);
  });

  sendBtn?.addEventListener('click', ()=>{
    const v = text.value.trim(); if (!v) return;
    text.value = '';
    postLocal(v);
  });
  text?.addEventListener('keydown', e=>{ if(e.key==='Enter') sendBtn.click(); });

  chan.onmessage = evt=>{
    if (evt.data?.type === 'new' && evt.data.room === room) renderRoom(room);
  };

  console.log('[Chat] Using local fallback (no backend)');
}
