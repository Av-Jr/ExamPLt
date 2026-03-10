import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.json());
app.use(cors());

const AUTH_DB = path.join(__dirname, "UserAuth.json");
const EXAMS_DB = path.join(__dirname, "Exams.json");

// Helper to handle reading and writing to JSON files safely
const readData = (file, isAuthFile = false) => {
  if (!fs.existsSync(file)) {
    const initial = isAuthFile ? { users: [], groups: [], attempts: [] } : [];
    fs.writeFileSync(file, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    // Safety check: Ensure attempts array exists to prevent .filter() crashes
    if (isAuthFile && !data.attempts) data.attempts = [];
    return data;
  } catch (e) {
    return isAuthFile ? { users: [], groups: [], attempts: [] } : [];
  }
};

const writeData = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

/* --- Auth Routes --- */
app.post("/signup", (req, res) => {
  const { realName, role, username, password } = req.body;
  const db = readData(AUTH_DB, true);
  if (db.users.find(u => u.username === username)) return res.status(400).json({ ok: false });
  db.users.push({ realName, role, username, password });
  writeData(AUTH_DB, db);
  res.json({ ok: true, realName, role });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const db = readData(AUTH_DB, true);
  const user = db.users.find(u => u.username === username && u.password === password);
  user ? res.json({ ok: true, role: user.role, realName: user.realName }) : res.status(401).json({ ok: false });
});

/* --- Teacher Features --- */
app.post("/save-exam", (req, res) => {
  const { teacher, title, timeLimit, dueDate, questions } = req.body;
  const exams = readData(EXAMS_DB, false);
  exams.push({
    id: "EX-" + Date.now(),
    teacher,
    title,
    timeLimit: parseInt(timeLimit) || 60,
    dueDate,
    questions,
    createdAt: Date.now()
  });
  writeData(EXAMS_DB, exams);
  res.json({ ok: true });
});

/* --- Student Features --- */
app.get("/get-exams", (req, res) => {
  const exams = readData(EXAMS_DB, false);
  res.json({ ok: true, exams });
});

app.post("/history", (req, res) => {
  const { username } = req.body;
  const db = readData(AUTH_DB, true);
  const history = db.attempts.filter((a) => a.username === username);
  res.json({ ok: true, history });
});

app.post("/attempt-exam", (req, res) => {
  const { examId, username, answers } = req.body;
  const db = readData(AUTH_DB, true);
  db.attempts.push({ examId, username, answers, submittedAt: Date.now() });
  writeData(AUTH_DB, db);
  res.json({ ok: true });
});

app.listen(5001, () => console.log("Server running at http://localhost:5001"));