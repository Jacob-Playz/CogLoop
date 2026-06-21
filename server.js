// server.js
// ────────────────────────────────────────────────────────────────
// Tiny Express backend. Keeps the API key server-side and exposes
// one endpoint per phase. The static demo (index.html) calls these.
//
//   POST /api/morning    → reflect-then-organize a brain dump
//   POST /api/execution  → handle a drift check-in
//   POST /api/night      → produce reflection + warm draft for tomorrow
//
// Run:  npm install && npm start   (after adding your key to .env)
// ────────────────────────────────────────────────────────────────

import "dotenv/config";
import express from "express";
import { askClaudeJSON } from "./src/claude.js";
import { MORNING_SYSTEM_PROMPT, withCarryover } from "./src/prompts/morning.js";
import { EXECUTION_SYSTEM_PROMPT } from "./src/prompts/execution.js";
import { NIGHT_SYSTEM_PROMPT } from "./src/prompts/night.js";

const app = express();
app.use(express.json());
app.use(express.static(".")); // serves index.html

// Health check — handy for verifying the key is wired before demoing.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, keyPresent: Boolean(process.env.ANTHROPIC_API_KEY) });
});

// ── Morning Clarity ──────────────────────────────────────────────
app.post("/api/morning", async (req, res) => {
  try {
    const { brainDump, confirmed, carryRule } = req.body;
    const system = withCarryover(carryRule);
    const messages = [{ role: "user", content: brainDump }];
    if (confirmed) {
      messages.push({
        role: "user",
        content: "Yes, that's the right tension. Now organize it into my plan.",
      });
    }
    const result = await askClaudeJSON(system, messages);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Execution / Drift ────────────────────────────────────────────
app.post("/api/execution", async (req, res) => {
  try {
    const { selfAssessment, label, morningReason, focusRule } = req.body;
    const content =
      `Focus self-assessment: ${selfAssessment}. ` +
      `Named pull: ${label || "not sure"}. ` +
      `My morning reason was: "${morningReason}". ` +
      `My relevant focus rule was: "${focusRule}".`;
    const result = await askClaudeJSON(EXECUTION_SYSTEM_PROMPT, [
      { role: "user", content },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Night Reflection ─────────────────────────────────────────────
app.post("/api/night", async (req, res) => {
  try {
    const { plan, deeperReason, driftLog, answers } = req.body;
    const content =
      `This morning's plan: ${JSON.stringify(plan)}.\n` +
      `My deeper reason: "${deeperReason}".\n` +
      `Today's consented drift log: ${JSON.stringify(driftLog)}.\n` +
      `My answers to the three questions: ${JSON.stringify(answers)}.`;
    const result = await askClaudeJSON(NIGHT_SYSTEM_PROMPT, [
      { role: "user", content },
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CogLoop running → http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("⚠  No ANTHROPIC_API_KEY found. Add it to .env to enable live AI.");
  }
});
