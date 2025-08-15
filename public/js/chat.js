<!-- Main Page Chat (Single Room: general) -->
<script type="module">
  import { auth, db } from "./js/firebase.js";
  import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
  import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

  const feed      = document.getElementById('chat-messages');   // container for messages
  const text      = document.getElementById('chat-input');      // message input
  const sendBtn   = document.getElementById('chat-send');       // send button
  const logoutBtn = document.getElementById('logout');          // logout button
  const status    = document.getElementById('status');          // optional status display

  let displayName = 'Member';
  let stopListen = null;

  // Firestore subcollection path
  const roomColl = () => collection(db, "rooms", "general", "messages");

  // Render a single message
  function bubble({ text, uid, displayName: dn, createdAt }) {
    const me  = auth.currentUser?.uid && uid === auth.currentUser.uid;
    const el  = document.createElement('div');
    const when = createdAt?.seconds
      ? new Date(createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    el.className = 'msg';
    el.innerHTML = `<div class="${me ? 'me' : 'other'}"><strong>${dn || 'Member'}:</strong> ${text || ''}</div><div class="meta">${when}</div>`;
    return el;
  }

  // Listen for messages in "general" room
  function listen() {
    stopListen?.();
    feed.innerHTML = '';
    const q = query(roomColl(), orderBy("createdAt", "asc"));
    stopListen = onSnapshot(q, (snap) => {
      feed.innerHTML = '';
      snap.forEach((d) => feed.appendChild(bubble(d.data())));
      feed.scrollTop = feed.scrollHeight;
    });
  }

  // Send a message
  async function send() {
    const v = text.value.trim();
    if (!v || !auth.currentUser) return;
    text.value = '';
    await addDoc(roomColl(), {
      text: v,
      uid: auth.currentUser.uid,
      displayName,
      createdAt: serverTimestamp(),
    });
  }

  // Events
  sendBtn?.addEventListener('click', send);
  text?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });

  logoutBtn?.addEventListener('click', async () => {
    try {
      await signOut(auth);
    } finally {
      location.replace('./login.html');
    }
  });

  // Auth check
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      location.replace('./login.html');
      return;
    }
    displayName = user.displayName || 'Member';
    if (status) status.textContent = `Connected as ${displayName} in #general`;
    listen();
  });
</script>
