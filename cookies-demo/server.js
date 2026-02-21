import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json());

// Mock auth: login returns Set-Cookie from server (like real auth)
app.post("/api/login", (req, res) => {
  const username = (req.body?.username || req.query?.username || "guest")
    .trim()
    .slice(0, 50);
  const token =
    "sess_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  res.setHeader("Content-Type", "application/json");
  res.cookie("session", token, {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  res.cookie("user", username, {
    maxAge: 60 * 60 * 1000,
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });
  res.json({ ok: true, user: username });
});

// Who am I? Reads cookies sent by browser (cookie comes from server)
app.get("/api/me", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const cookieHeader = req.headers.cookie || "";
  const session = cookieHeader
    .split(";")
    .find((s) => s.trim().startsWith("session="));
  const userMatch = cookieHeader
    .split(";")
    .find((s) => s.trim().startsWith("user="));
  const user = userMatch
    ? decodeURIComponent(userMatch.split("=")[1]?.trim() || "")
    : null;
  if (!session || !user) {
    res.status(401).json({ error: "Not logged in" });
    return;
  }
  res.json({ user });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => console.log("http://localhost:" + PORT));
