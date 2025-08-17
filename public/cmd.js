
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

// Like user
async function likeUser(actorId, targetId) {
  return http(`${ENDPOINT_BASE}/like`, {
    method: "POST",
    body: { actorId, targetId }
  });
}

// Get matches
async function getMatches(userId) {
  return http(`${ENDPOINT_BASE}/getMatches?userId=${encodeURIComponent(userId)}`);
}

// Render matches into a container
async function renderMatches(userId, containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = "Loading matches...";
  try {
    const data = await getMatches(userId);
    if (!data.matches.length) {
      el.innerHTML = "No matches yet.";
      return;
    }
    el.innerHTML = data.matches.map(m =>
      `<div>${m.other || "Unknown"} (Match ID: ${m.id})</div>`
    ).join("");
  } catch (e) {
    el.innerHTML = "Error loading matches.";
    console.error(e);
  }
}

// Attach like buttons with data-like-target attr
function attachLikeButtons(actorId) {
  document.querySelectorAll("[data-like-target]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-like-target");
      btn.disabled = true;
      const res = await likeUser(actorId, targetId);
      btn.textContent = res.matched ? "Matched!" : "Liked ✓";
    });
  });
}
