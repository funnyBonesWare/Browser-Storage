const logEl = document.getElementById("log");
const usernameEl = document.getElementById("username");
const themeEl = document.getElementById("theme");

function log(msg) {
  logEl.textContent = (logEl.textContent ? logEl.textContent + "\n" : "") + msg;
}

// --- Server auth (cookies from server) ---
async function login() {
  const username = usernameEl.value.trim() || "guest";
  const r = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
    credentials: "include",
  });
  if (!r.ok) throw new Error(r.status);
  const data = await r.json();
  log("Logged in: " + data.user);
}

async function me() {
  const r = await fetch("/api/me", { credentials: "include" });
  const data = await r.json();
  if (r.ok) log("Me: " + data.user);
  else log("Me: " + (data.error || r.status));
}

// --- Client theme (document.cookie only) ---
const THEME_KEY = "theme";
const THEME_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getTheme() {
  const m = document.cookie.match(new RegExp(THEME_KEY + "=([^;]+)"));
  return m ? m[1] : "light";
}

function setTheme(value) {
  document.cookie = `${THEME_KEY}=${value}; max-age=${THEME_MAX_AGE}; path=/; samesite=lax`;
  document.documentElement.dataset.theme = value;
}

function applyTheme(value) {
  setTheme(value);
  themeEl.value = value;
}

themeEl.addEventListener("change", () => applyTheme(themeEl.value));

// Init: apply saved theme from client cookie
applyTheme(getTheme());

// Buttons
document.querySelectorAll("[data-action]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const action = btn.dataset.action;
    try {
      if (action === "login") await login();
      else if (action === "me") await me();
    } catch (e) {
      log("Error: " + e.message);
    }
  });
});
