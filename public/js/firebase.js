<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>UNHINGED — App</title>
  <meta name="theme-color" content="#E11D2A" />
  <style>
    :root{ --red:#E11D2A; --panel:#171923; --muted:#b8b9c6; --radius:16px; }
    *{box-sizing:border-box}
    html,body{margin:0;background:#0f0f12;color:#fff;font:500 16px/1.5 Inter,system-ui,Segoe UI,Roboto,Arial}
    a{color:inherit;text-decoration:none}
    .wrap{max-width:1280px;margin:0 auto;padding:16px}
    header{border-bottom:1px solid rgba(255,255,255,.06)}
    .bar{display:flex;justify-content:space-between;align-items:center;gap:12px}
    .logo{display:flex;align-items:center;gap:10px}
    .mark{width:28px;height:28px;background:var(--red);border-radius:8px}
    .word{font-weight:1000}
    nav{display:flex;gap:10px}
    .btn{display:inline-flex;align-items:center;border:1px solid rgba(255,255,255,.12);padding:10px 14px;border-radius:12px;font-weight:800;background:transparent;cursor:pointer}
    .btn.primary{background:var(--red);border-color:var(--red);color:#fff}
    .btn.ghost{background:transparent}
    .card{background:var(--panel);border:1px solid rgba(255,255,255,.08);border-radius:var(--radius);overflow:hidden}
    .card h2{margin:0;padding:14px 14px;border-bottom:1px solid rgba(255,255,255,.06);background:#12131a;position:relative}
    .card-body{padding:14px}

    .gridTop{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}
    .gridBottom{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}
    .bigPane{min-height:68vh;display:flex;flex-direction:column}
    .smallPane{min-height:48vh;display:flex;flex-direction:column}

    .live-box{height:100%;min-height:52vh;background:#000;border-radius:14px;display:flex;align-items:center;justify-content:center}
    .live-pill{position:absolute;right:14px;top:12px;display:inline-flex;gap:6px;align-items:center;font-size:12px;border:1px solid rgba(255,255,255,.16);padding:4px 8px;border-radius:999px;background:#1a1b22}
    .dot{width:8px;height:8px;border-radius:50%;background:#ff4d5e;animation:blink 1.2s infinite}
    @keyframes blink{50%{opacity:.35}}

    .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .muted{color:var(--muted)}
    input,select,textarea{padding:10px;border-radius:10px;border:1px solid #2a2c3a;background:#12131a;color:#fff}
    .chat-feed{flex:1;min-height:0;height:100%;max-height:calc(68vh - 160px);overflow:auto;background:#0e0f14;border:1px solid #2a2c39;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px}
    .bubble{max-width:78%;padding:10px 12px;border-radius:12px;word-wrap:break-word}
    .me{align-self:flex-end;background:var(--red)}
    .them{align-self:flex-start;background:#2a2a36}
    .chat-send{display:flex;gap:8px;margin-top:10px}
    .chat-send input{flex:1}

    .list{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}
    .item{border:1px solid #2a2c39;background:#12131a;border-radius:12px;padding:10px;cursor:pointer}
    .title{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .meta{font-size:12px;color:var(--muted);margin-top:4px}

    .modal-backdrop{position:fixed;inset:0;background:#0009;display:none;align-items:center;justify-content:center;padding:16px;z-index:50}
    .modal{width:100%;max-width:520px;background:#171923;border:1px solid #2a2c39;border-radius:14px;padding:14px}
    .modal h3{margin:0 0 8px}
    .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}

    @media (max-width:960px){
      .gridTop,.gridBottom{grid-template-columns:1fr}
    }
  </style>
</head>
<body>
  <header>
    <div class="wrap bar">
      <div class="logo"><div class="mark"></div><div class="word">UNHINGED</div></div>
      <nav>
        <a class="btn" href="./profile.html">Profile</a>
        <a class="btn" href="./login.html">Log in</a>
        <a class="btn primary" href="./signup.html">Join</a>
      </nav>
    </div>
  </header>

  <main class="wrap">
    <div class="gridTop">
      <section class="card bigPane">
        <h2>Live Stream <span class="live-pill"><span class="dot"></span> LIVE</span></h2>
        <div class="card-body" style="flex:1;display:flex;">
          <div class="live-box" style="flex:1;"><span style="opacity:.65">[ Embed live stream here ]</span></div>
        </div>
      </section>

      <section class="card bigPane">
        <h2>Chat Room</h2>
        <div class="card-body" style="display:flex;flex-direction:column;gap:10px;flex:1">
          <div class="row" style="justify-content:space-between">
            <div class="muted" id="meTag">(not in chat)</div>
            <div class="row">
              <button class="btn primary" id="enterChatBtn">Enter Chat</button>
              <button class="btn" id="leaveChatBtn" style="display:none">Leave</button>
            </div>
          </div>
          <div class="row" id="roomBar" style="display:none">
            <label class="muted" for="roomSelect">Room</label>
            <select id="roomSelect"></select>
          </div>
          <div class="chat-feed" id="chatFeed" aria-live="polite"></div>
          <div class="chat-send" id="sendRow" style="display:none">
            <input id="chatInput" placeholder="Type a message…" />
            <button class="btn primary" id="chatSend">Send</button>
          </div>
        </div>
      </section>
    </div>

    <div class="gridBottom">
      <section class="card smallPane">
        <h2>Chaos Board</h2>
        <div class="card-body" style="display:flex;flex-direction:column;gap:10px;flex:1">
          <div class="row" style="justify-content:space-between">
            <div></div>
            <button class="btn primary" id="uploadChaos">Submit Chaos Story</button>
          </div>
          <div class="list" id="chaosList"></div>
        </div>
      </section>

      <section class="card smallPane">
        <h2>Review Board</h2>
        <div class="card-body" style="display:flex;flex-direction:column;gap:10px;flex:1">
          <div class="row" style="justify-content:space-between">
            <div></div>
            <button class="btn primary" id="uploadReview">Submit Review</button>
          </div>
          <div class="list" id="reviewList"></div>
        </div>
      </section>
    </div>
  </main>

  <!-- Modals for chaos, review, detail -->
  <div class="modal-backdrop" id="chaosModal">
    <div class="modal">
      <h3>Submit Chaos Story</h3>
      <label class="muted" for="cTitle">Title (max 60 chars)</label>
      <input id="cTitle" maxlength="60" placeholder="Walked Out on the Check" />
      <label class="muted" for="cAbout" style="margin-top:8px">About (name or @username)</label>
      <input id="cAbout" placeholder="@TheirHandle or Name" />
      <label class="muted" for="cBody" style="margin-top:8px">Story</label>
      <textarea id="cBody" rows="5" placeholder="Tell us what happened…"></textarea>
      <div class="actions">
        <button class="btn" id="cCancel">Cancel</button>
        <button class="btn primary" id="cSave">Submit</button>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="reviewModal">
    <div class="modal">
      <h3>Submit Review</h3>
      <label class="muted" for="rTitle">Title (max 60 chars)</label>
      <input id="rTitle" maxlength="60" placeholder="Good Chat, No Show" />
      <label class="muted" for="rAbout" style="margin-top:8px">About (name or @username)</label>
      <input id="rAbout" placeholder="@TheirHandle or Name" />
      <label class="muted" for="rBody" style="margin-top:8px">Review</label>
      <textarea id="rBody" rows="5" placeholder="Keep receipts, keep it real…"></textarea>
      <div class="actions">
        <button class="btn" id="rCancel">Cancel</button>
        <button class="btn primary" id="rSave">Submit</button>
      </div>
    </div>
  </div>

  <div class="modal-backdrop" id="detailModal">
    <div class="modal">
      <h3 id="detailTitle">Title</h3>
      <div class="muted" id="detailMeta" style="margin-bottom:8px"></div>
      <div id="detailBody" style="white-space:pre-wrap"></div>
      <div class="actions">
        <button class="btn" id="detailClose">Close</button>
      </div>
    </div>
  </div>

  <script type="module">
    // ===== Firebase import =====
    import { auth, db } from "./js/firebase.js";
    import {
      onAuthStateChanged
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
    import {
      collection, addDoc, serverTimestamp, onSnapshot,
      query, orderBy, limit, getDoc, doc
    } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

    // ===== Chat configuration =====
    const ROOMS = [
      { id: "general",      label: "#general" },
      { id: "first-dates",  label: "#first-dates" },
      { id: "gym-rats",     label: "#gym-rats" },
      { id: "chaos-lounge", label: "#chaos-lounge" },
    ];

    let me = null;
    let myDisplayName = "";
    let currentRoom = ROOMS[0].id;
    let unsubFeed = null;

    // DOM references
    const meTag = document.getElementById("meTag");
    const enterChatBtn = document.getElementById("enterChatBtn");
    const leaveChatBtn = document.getElementById("leaveChatBtn");
    const roomBar = document.getElementById("roomBar");
    const roomSelect = document.getElementById("roomSelect");
    const chatFeed = document.getElementById("chatFeed");
    const sendRow = document.getElementById("sendRow");
    const chatInput = document.getElementById("chatInput");
    const chatSend = document.getElementById("chatSend");

    const chaosList = document.getElementById("chaosList");
    const reviewList = document.getElementById("reviewList");
    const chaosModal = document.getElementById("chaosModal");
    const cTitle = document.getElementById("cTitle");
    const cAbout = document.getElementById("cAbout");
    const cBody  = document.getElementById("cBody");
    const cCancel= document.getElementById("cCancel");
    const cSave  = document.getElementById("cSave");
    const reviewModal = document.getElementById("reviewModal");
    const rTitle = document.getElementById("rTitle");
    const rAbout = document.getElementById("rAbout");
    const rBody  = document.getElementById("rBody");
    const rCancel= document.getElementById("rCancel");
    const rSave  = document.getElementById("rSave");
    const detailModal = document.getElementById("detailModal");
    const detailTitle = document.getElementById("detailTitle");
    const detailMeta  = document.getElementById("detailMeta");
    const detailBody  = document.getElementById("detailBody");
    const detailClose = document.getElementById("detailClose");
    const uploadChaos  = document.getElementById("uploadChaos");
    const uploadReview = document.getElementById("uploadReview");

    // UI helpers
    function openModal(el){ el.style.display = "flex"; }
    function closeModal(el){ el.style.display = "none"; }
    function setSigned(on){
      const label = ROOMS.find(r=>r.id === currentRoom)?.label || "#general";
      meTag.textContent = on ? `In ${label} as ${myDisplayName}` : "(not in chat)";
      enterChatBtn.style.display = on ? "none" : "inline-flex";
      leaveChatBtn.style.display = on ? "inline-flex" : "none";
      roomBar.style.display = on ? "flex" : "none";
      sendRow.style.display = on ? "flex" : "none";
    }
    function renderRooms(){
      roomSelect.innerHTML = "";
      ROOMS.forEach(r=>{
        const opt = document.createElement("option");
        opt.value = r.id; opt.textContent = r.label;
        if (r.id === currentRoom) opt.selected = true;
        roomSelect.appendChild(opt);
      });
    }
    function renderMessage(m){
      const div = document.createElement("div");
      div.className = "bubble " + (m.from === myDisplayName ? "me" : "them");
      div.textContent = `${m.from}: ${m.text}`;
      chatFeed.appendChild(div);
    }
    function clearFeed(){ chatFeed.innerHTML = ""; }

    async function bindRoomFeed(){
      if (unsubFeed) { unsubFeed(); unsubFeed = null; }
      clearFeed();
      const col = collection(db, "rooms", currentRoom, "messages");
      const qy  = query(col, orderBy("createdAt","asc"), limit(500));
      unsubFeed = onSnapshot(qy, (snap)=>{
        clearFeed();
        snap.forEach(docSnap => {
          const m = docSnap.data();
          renderMessage({ from: m.from || "anon", text: m.text || "" });
        });
        chatFeed.scrollTop = chatFeed.scrollHeight;
      });
    }

    async function sendMessage(){
      const text = chatInput.value.trim();
      if (!text) return;
      if (!me){ location.href = "./login.html"; return; }
      if (!myDisplayName){ alert("Your profile needs a username/display name."); return; }
      const col = collection(db, "rooms", currentRoom, "messages");
      await addDoc(col, { from: myDisplayName, text, createdAt: serverTimestamp(), uid: me.uid });
      chatInput.value = "";
    }

    function bestVisibleNameFromDoc(docData){
      const uname = (docData?.username || "").trim();
      const disp  = (docData?.displayName || "").trim();
      if (uname) return uname.startsWith("@") ? uname : "@"+uname;
      if (disp)  return disp;
      return "";
    }

    // Boards (in-memory examples)
    const chaosItems = [{
      title: "Walked Out on the Check",
      author: "@Rae25",
      about: "@Jamie27",
      body: "We agreed to split. They ‘forgot’ their wallet. I left a bigger tip for the server and a smaller chance for a second date."
    }];
    const reviewItems = [{
      title: "Great Banter, Late Arrival",
      author: "@Andre31",
      about: "@Rae25",
      body: "Funny, sharp, showed with coffee… 18 minutes late. Would try again—with a buffer."
    }];

    function renderBoard(listEl, items){
      listEl.innerHTML = "";
      items.forEach(it=>{
        const card = document.createElement("div");
        card.className = "item";
        card.innerHTML = `
          <div class="title" title="${escapeHtml(it.title)}">${escapeHtml(it.title)}</div>
          <div class="meta">by ${escapeHtml(it.author)} about ${escapeHtml(it.about)}</div>
        `;
        card.addEventListener("click", ()=>{
          detailTitle.textContent = it.title;
          detailMeta.textContent = `by ${it.author} about ${it.about}`;
          detailBody.textContent = it.body;
          openModal(detailModal);
        });
        listEl.appendChild(card);
      });
    }
    function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

    // Submit handlers for chaos and reviews
    cSave.addEventListener("click", ()=>{
      const title = (cTitle.value||"").trim().slice(0,60);
      const about = (cAbout.value||"").trim();
      const body  = (cBody.value||"").trim();
      if (!title || !about || !body) return;
      const author = myDisplayName || "Member";
      chaosItems.unshift({ title, author, about, body });
      renderBoard(chaosList, chaosItems);
      cTitle.value = ""; cAbout.value = ""; cBody.value = "";
      closeModal(chaosModal);
    });
    rSave.addEventListener("click", ()=>{
      const title = (rTitle.value||"").trim().slice(0,60);
      const about = (rAbout.value||"").trim();
      const body  = (rBody.value||"").trim();
      if (!title || !about || !body) return;
      const author = myDisplayName || "Member";
      reviewItems.unshift({ title, author, about, body });
      renderBoard(reviewList, reviewItems);
      rTitle.value = ""; rAbout.value = ""; rBody.value = "";
      closeModal(reviewModal);
    });

    // Modal toggles
    uploadChaos.addEventListener("click", ()=> openModal(chaosModal));
    uploadReview.addEventListener("click", ()=> openModal(reviewModal));
    cCancel.addEventListener("click", ()=> closeModal(chaosModal));
    rCancel.addEventListener("click", ()=> closeModal(reviewModal));
    chaosModal.addEventListener("click", (e)=>{ if(e.target===chaosModal) closeModal(chaosModal); });
    reviewModal.addEventListener("click", (e)=>{ if(e.target===reviewModal) closeModal(reviewModal); });
    detailClose.addEventListener("click", ()=> closeModal(detailModal));
    detailModal.addEventListener("click", (e)=>{ if(e.target===detailModal) closeModal(detailModal); });

    // Chat controls (no anonymous posts)
    enterChatBtn.addEventListener("click", async ()=>{
      if (!me) { location.href = "./login.html"; return; }
      if (!myDisplayName){ alert("Your profile needs a username/display name."); return; }
      setSigned(true);
      renderRooms();
      await bindRoomFeed();
      chatInput.focus();
    });
    leaveChatBtn.addEventListener("click", ()=>{
      if (unsubFeed) { unsubFeed(); unsubFeed = null; }
      setSigned(false);
    });
    roomSelect.addEventListener("change", async (e)=>{
      currentRoom = e.target.value;
      if (leaveChatBtn.style.display !== "none") await bindRoomFeed();
    });
    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e)=>{ if(e.key === "Enter") sendMessage(); });

    // Auth: derive display name from Firestore user doc
    onAuthStateChanged(auth, async (user)=>{
      me = user || null;
      myDisplayName = "";
      if (me) {
        try {
          const uref = doc(db, "users", me.uid);
          const snap = await getDoc(uref);
          if (snap.exists()) myDisplayName = bestVisibleNameFromDoc(snap.data());
          if (!myDisplayName) {
            const emailName = (me.email || "").split("@")[0];
            myDisplayName = emailName || "Member";
          }
        } catch (e) {
          const emailName = (me.email || "").split("@")[0];
          myDisplayName = emailName || "Member";
        }
      }
      setSigned(false);
    });

    // Initialization
    (function init(){
      renderRooms();
      renderBoard(chaosList, chaosItems);
      renderBoard(reviewList, reviewItems);
    })();
  </script>
</body>
</html>
