import { db, auth } from './firebase.js';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const roomSelect = document.getElementById('room');
const handleInput = document.getElementById('handle');
const enterBtn = document.getElementById('enter');
const statusEl = document.getElementById('status');
const feed = document.getElementById('feed');
const textInput = document.getElementById('text');
const sendBtn = document.getElementById('send');

let currentRoom = null;
let unsub = null;

enterBtn.addEventListener('click', () => {
  currentRoom = roomSelect.value;
  if (!currentRoom) return;
  statusEl.textContent = `Connected to #${currentRoom}`;
  textInput.disabled = false;
  sendBtn.disabled = false;
  loadMessages();
});

sendBtn.addEventListener('click', async () => {
  const text = textInput.value.trim();
  if (!text) return;
  const name = auth.currentUser?.displayName || handleInput.value || 'Anon';
  await addDoc(collection(db, 'rooms', currentRoom, 'messages'), {
    name,
    text,
    ts: serverTimestamp()
  });
  textInput.value = '';
});

function loadMessages() {
  if (unsub) unsub();
  const q = query(collection(db, 'rooms', currentRoom, 'messages'), orderBy('ts'));
  unsub = onSnapshot(q, snapshot => {
    feed.innerHTML = '';
    snapshot.forEach(doc => {
      const d = doc.data();
      const div = document.createElement('div');
      div.className = 'msg';
      div.innerHTML = `<span class="meta">[${d.ts?.toDate().toLocaleTimeString() || ''}]</span> <b>${d.name}:</b> ${d.text}`;
      feed.appendChild(div);
    });
    feed.scrollTop = feed.scrollHeight;
  });
}
