// src/claude.js
// ────────────────────────────────────────────────────────────────
// Thin, real client for the Anthropic Messages API.
// The API key is read from the environment — never hard-coded,
// never sent to the browser. This is the only place we talk to Claude.
// ────────────────────────────────────────────────────────────────

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.COGLOOP_MODEL || "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";

/**
 * Send a single-turn request to Claude with a system prompt.
 * @param {string} systemPrompt - the phase-specific system prompt
 * @param {Array<{role: string, content: string}>} messages - conversation
 * @returns {Promise<string>} the assistant's text reply
 */
export async function askClaude(systemPrompt, messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key."
    );
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Claude API error ${res.status}: ${detail}`);
  }

  const data = await res.json();
  // Concatenate any text blocks the model returned.
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * Convenience helper: ask Claude and parse a STRICT JSON reply.
 * Strips accidental markdown fences before parsing.
 */
export async function askClaudeJSON(systemPrompt, messages) {
  const raw = await askClaude(systemPrompt, messages);
  const clean = raw.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    throw new Error("Model did not return valid JSON:\n" + raw);
  }
}
