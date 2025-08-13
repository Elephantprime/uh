// js/chat.js — Unhinged Chat (Firebase if present, otherwise local fallback)

/* DOM */
const roomSel = document.getElementById('room');
const handle  = document.getElementById('handle');
const enter   = document.getElementById('enter');
const status  = document.getElementById('status');
const feed    = document.getElementById('feed');
const text    = document.getElementById('text');
const sendBtn = document.getElementById('send');

let room = roomSel?.value || 'lobby';
let name = '';
const timeFmt = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function renderMessage(m, mine=false){
  const div = document.createElement('div');
  div.className = 'msg';
  div.innerHTML = `
    <div class="${mine?'me':'other'}"><strong>${m.user}</strong> — ${m.text}</div>
    <div class="meta">${timeFmt(m.ts)}</div>
  `;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
}

function setLiveUI(enabled){
  text.disabled = !enabled;
  sendBtn.disabled = !enabled;
}

/* =========================
   PATH A: FIREBASE (if present)
   ========================= */
const hasFirebase = typeof window !== 'undefined' && window.db && typeof window.db.collection === 'function';

if (hasFirebase) {
  let unsub = null;

  async function joinFirebase(newRoom){
    if (unsub) { unsub(); unsub = null; }
    room = newRoom;
    feed.innerHTML = '';
    // live stream oldest→newest
    unsub = window.db.collection('rooms').doc(room).collection('messages')
      .orderBy('ts', 'asc')
      .limit(200)
      .onSnapshot(snap=>{
        feed.innerHTML = '';
        snap.forEach(doc=>{
          const m = doc.data();
          renderMessage(m, m.user === name);
        });
      });
  }

  async function sendFirebase(){
    const val = text.value.trim();
    if (!val) return;
    text.value = '';
    await window.db.collection('rooms').doc(room).collection('messages').add({
      user: name,
      text: val.slice(0, 500),
      ts: Date.now()
    });
  }

  // Wire UI
  enter.addEventListener('click', async ()=>{
    name = (handle.value || '').trim();
    if (!name) { alert('Enter your name.'); return; }
    status.textContent = `Connected as ${name}`;
    setLiveUI(true);
    await joinFirebase(roomSel.value);
  });

  roomSel.addEventListener('change', async e=>{
    if (!name) { room = e.target.value; return; }
    await joinFirebase(e.target.value);
  });

  sendBtn.addEventListener('click', sendFirebase);
  text.addEventListener('keydown', e=>{ if(e.key==='Enter') sendFirebase(); });

  // Done with Firebase path
  console.log('[Chat] Using Firebase backend');

} else {
/* =========================
   PATH B: LOCAL FALLBACK (no backend)
   - Works across tabs on the same device via BroadcastChannel
   - Persists locally via localStorage
   ========================= */
  const chan = new BroadcastChannel('unhinged_chat');

  function key(r){ return `uh_chat_${r}`; }
  function load(r){ return JSON.parse(localStorage.getItem(key(r)) || '[]'); }
  function save(r, arr){ localStorage.setItem(key(r), JSON.stringify(arr)); }

  function renderRoom(r){
    feed.innerHTML = '';
    load(r).slice(-200).forEach(m=>{
      renderMessage(m, m.user === name);
    });
  }

  function postLocal(textVal){
    const msg = { user: name, text: textVal.slice(0, 500), ts: Date.now(), room };
    const arr = load(room); arr.push(msg); save(room, arr);
    renderRoom(room);
    chan.postMessage({ type: 'new', room });
  }

  // Wire UI
  enter.addEventListener('click', ()=>{
    name = (handle.value || '').trim();
    if (!name) { alert('Enter your name.'); return; }
    status.textContent = `Connected as ${name}`;
    setLiveUI(true);
    renderRoom(roomSel.value);
  });

  roomSel.addEventListener('change', e=>{
    room = e.target.value;
    if (!name) return;
    renderRoom(room);
  });

  sendBtn.addEventListener('click', ()=>{
    const v = text.value.trim(); if (!v) return;
    text.value = '';
    postLocal(v);
  });
  text.addEventListener('keydown', e=>{ if(e.key==='Enter') sendBtn.click(); });

  chan.onmessage = evt=>{
    if (evt.data?.type === 'new' && evt.data.room === room) renderRoom(room);
  };

  console.log('[Chat] Using local fallback (no backend)');
}
```0
