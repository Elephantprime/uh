/* public/cmd.js — Likes & Matches client helpers (no build tools needed) */
(function () {
  const ENDPOINT_BASE = "https://us-central1-unhinged-8c6da.cloudfunctions.net";

  async function http(url, opts = {}) {
    const res = await fetch(url, {
      method: opts.method || "GET",
      headers: { "Content-Type": "application/json" },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: "include"
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  /** Like: A -> B */
  async function likeUser(actorId, targetId) {
    if (!actorId || !targetId) throw new Error("actorId and targetId required");
    return http(`${ENDPOINT_BASE}/like`, {
      method: "POST",
      body: { actorId, targetId }
    });
  }

  /** Get matches for userId */
  async function getMatches(userId) {
    if (!userId) throw new Error("userId required");
    return http(`${ENDPOINT_BASE}/getMatches?userId=${encodeURIComponent(userId)}`);
  }

  /** Render matches into a container (by id) */
  async function renderMatches(userId, containerId) {
    const el = document.getElementById(containerId);
    if (!el) throw new Error(`Container not found: #${containerId}`);
    el.innerHTML = "Loading matches…";
    try {
      const data = await getMatches(userId);
      const list = data.matches || [];
      if (!list.length) {
        el.innerHTML = "No matches yet.";
        return;
      }
      el.innerHTML = `
        <div style="display:grid;gap:12px">
          ${list
            .map(
              (m) => `
            <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;display:flex;justify-content:space-between;align-items:center">
              <div>
                <div style="font-weight:600">${m.other ?? "Unknown"}</div>
                <div style="font-size:12px;color:#6b7280">Match ID: ${m.id}</div>
              </div>
              <button data-match="${m.id}" style="padding:8px 12px;border-radius:8px;border:1px solid #d1d5db;background:#f9fafb;cursor:pointer">
                Open Chat
              </button>
            </div>`
            )
            .join("")}
        </div>
      `;
    } catch (e) {
      console.error(e);
      el.innerHTML = `<span style="color:#b91c1c">Failed to load matches.</span>`;
    }
  }

  /** Wire all buttons like: <button data-like-target="USER_ID">Like</button> */
  function attachLikeButtons(actorId, selector = "[data-like-target]") {
    document.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener("click", async () => {
        const targetId = btn.getAttribute("data-like-target");
        if (!targetId) return;
        btn.disabled = true;
        const prev = btn.textContent;
        btn.textContent = "Liking…";
        try {
          const res = await likeUser(actorId, targetId);
          btn.textContent = res.matched ? "Matched! 🎉" : "Liked ✓";
        } catch (e) {
          console.error(e);
          btn.textContent = "Error";
          setTimeout(() => (btn.textContent = prev), 1500);
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  // expose to window so you can call from inline <script>
  window.likeUser = likeUser;
  window.getMatches = getMatches;
  window.renderMatches = renderMatches;
  window.attachLikeButtons = attachLikeButtons;
})();
