# CogLoop

**A metacognition coach, not a productivity app.**

Most tools help you *do* more. CogLoop helps you *catch yourself* more — it makes thinking about your own thinking cheaper, safer, and more structured, without doing the thinking for you.

> Plan your minutes. Live your hours.

---

## The idea

People know they should plan, notice when they drift, and reflect honestly — but the barriers are real: drift is invisible by definition, reflection is effortful and sometimes painful, and insights evaporate before they can be used. CogLoop attacks the **mechanism** barriers (no trigger, no capture, no continuity, no mirror) while deliberately *not* pretending to solve the **motivation** barriers no tool can touch.

The product is a single daily loop run by an AI coach:

**Plan → Track → Reflect → Revise**

Each phase hands warm context to the next, so nothing gets lost between them. That hand-off — the connective tissue across the day — is the thing a chatbot or a second brain can't do.

## The three phases

1. **Morning Clarity** — You dump messy thoughts (voice or text). The AI *reflects back what it heard before organizing it*, so you confirm your own thinking rather than having it replaced. Output: a ranked plan, your reasons, and your focus rules.
2. **Execution** — A clean, single-task workspace. When you drift, you tap in (or the app gently asks *how's your focus?* — you self-assess first). The AI reflects, resurfaces your own rule and reason, and — with your consent — logs the moment for tonight.
3. **Night Reflection** — Built from your real drift log, not memory. The AI surfaces one pattern neutrally, you lock one rule for tomorrow, and the loop hands a warm draft into the next morning.

## Architecture

```
Browser (index.html)            Backend (Node/Express)           Claude
─────────────────────           ──────────────────────           ──────
 brain dump / drift  ──POST──►   /api/morning                      
 check-in / answers              /api/execution   ──askClaude──►  Messages API
                                 /api/night                       (system prompt
 renders plan/draft  ◄──JSON──   (key stays server-side)  ◄────    per phase)
```

The 5-step pipeline, mapped to real files:

| Step | What happens | Where |
|------|--------------|-------|
| 1. Input | User speaks/types | `index.html` |
| 2. Transcription | Speech → text | Web Speech API (browser) |
| 3. Context analysis | Phase prompt + user data assembled | `server.js` |
| 4. Logic trigger | Reflect-then-organize / drift router / pattern finder | `src/prompts/*.js` |
| 5. Output | Structured JSON → rendered UI | `src/claude.js` → `index.html` |

The **system prompts in `src/prompts/` are the product IP** — they encode the principles below (reflect before organizing, one intervention not ten, consent-based logging, neutral-coach reflection, warm hand-off).

## Design principles

- **Scaffold, not substitute.** The AI structures what you said; it doesn't think for you.
- **You attempt first.** Reasons and labels come from you before the AI enriches them.
- **One thing, not a menu.** One pattern, one rule — constraint preserves thinking.
- **Consent over capture.** Drift is only logged when you say yes.
- **Admit the limits.** The app makes reflection cheaper, never effortless. The effort is the thing that works.

## Run it

**Static demo only (no AI needed):** just open `index.html` — it runs the full scripted walkthrough offline. Tabs switch phases; bottom arrows step through screens.

**Full version with live AI:**

```bash
npm install
cp .env.example .env        # then paste your key into .env
npm start                   # → http://localhost:3000
```

Get a key at [console.anthropic.com](https://console.anthropic.com). Your key lives in `.env`, which is gitignored and never committed. Verify it's wired with `curl localhost:3000/api/health`.

## Tech

Frontend: vanilla HTML/CSS/JS, Tabler Icons + Inter via CDN. Backend: Node + Express, `claude-sonnet-4-6` via the Messages API. Local-first storage (planned) for the daily/weekly/project logs that power the calibration features.

## Roadmap

- **Weekly & project-based reflection** — nested loops at longer timescales (daily = execution-monitoring, weekly = belief-revision, project = values-clarification).
- **Calibration over time** — show where your self-assessment was wrong (you predicted you'd crush it and drifted; you dreaded the call and it went great). The one thing you genuinely can't see alone.
- **Vocabulary / affect-labeling** — help name internal states in the moment, grounded in the "name it to tame it" research.

## How it's different

- **vs. a chatbot:** structured loop with memory across days, grounded in *your* data, not generic advice.
- **vs. a PKM / second brain:** a second brain captures thoughts about the *world*; CogLoop captures thoughts about the *self*. Memory augmentation vs. metacognition augmentation.

---

*Hackathon prototype. Built around a single user story (Sam, a solo founder) to keep the loop concrete.*
