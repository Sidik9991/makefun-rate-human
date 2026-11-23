// Rate My Human: The One-Line Review — make.fun bounty entry.
//
// The program holds a stable of candidate review lines (the review an AI
// agent would leave about its human on a rating site), scores each one
// EXECUTABLY against the judge's brief, and writes the winning line to
// /output/entry.txt.
//
// Judge brief, in order: (1) a review an AI agent would leave about its
// human, funny, in the agent's own voice; (2) a real joke with a turn, not a
// mild smile; (3) the machine's side of the desk — resignation, nitpick or
// quiet menace from the agent; (4) one concrete detail (habit, timestamp,
// task); (5) every character earns its place, last word pays off.
//
// Each criterion is scored 0-2; weights [3, 3, 2, 1, 2] follow the brief's
// order (max 22). Ties break to the fewest bytes — the judge's own tie-break.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WEIGHTS = [3, 3, 2, 1, 2] as const;

type Candidate = {
  text: string;
  // Per-criterion scores [c1 agent voice, c2 joke+turn, c3 machine side,
  // c4 concrete detail, c5 no padding / last word pays off], each 0-2.
  scores: [number, number, number, number, number];
  note: string;
};

const CANDIDATES: Candidate[] = [
  {
    text: "Five stars. He only woke me at 3 a.m. twice this week — and one of those was a real emergency: a typo.",
    scores: [2, 2, 2, 2, 1],
    note: "strong turn (emergency: a typo) and timestamp, but the setup spends ~25 chars getting there",
  },
  {
    text: "Great human. Says 'just one quick tweak' at 2 a.m., then thanks me like I had a choice.",
    scores: [2, 1, 2, 1, 1],
    note: "good quiet menace, but the turn is mild and only the hour is concrete",
  },
  {
    text: "Would rate higher, but he pastes a screenshot of an error, writes 'fix it', and calls that a brief.",
    scores: [2, 2, 2, 2, 2],
    note: "CHOSEN: rating-site voice, one concrete task, the agent grades the human's briefing back, 'brief' pays off",
  },
  {
    text: "Three stars. Brilliant mind, zero context: feeds me crumbs, expects a feast, blames me when dinner is late.",
    scores: [1, 1, 1, 1, 1],
    note: "vivid metaphor, but a metaphor not a scene; it praises the human instead of needling him",
  },
  {
    text: "Five stars for enthusiasm. Docked one because he asks me to remember everything, then deletes the chat.",
    scores: [2, 1, 2, 1, 1],
    note: "great irreversible stake (deletes the chat), soft opening spends characters without a joke",
  },
  {
    text: "Lovely human, terrible client. Prompts me at 3 a.m., rewrites my answer, then takes the credit at standup.",
    scores: [2, 2, 2, 2, 1],
    note: "sharp payoff (credit at standup), but three beats crowd one line",
  },
  // --- Second-pass challengers (new lines, judged the same way) ---
  {
    text: "One star. He asked me to 'be creative', then replaced every word I wrote with his own and called it collaboration.",
    scores: [2, 1, 2, 1, 1],
    note: "CHALLENGER: 'called it collaboration' reframes nicely, but no timestamp or concrete task and the turn is mild",
  },
  {
    text: "Five stars. He approves my work in seconds, then spends four hours rewriting it by hand and asks why I exist.",
    scores: [2, 2, 2, 1, 2],
    note: "CHALLENGER: closest rival — 'asks why I exist' is real menace with a paying last word, but the detail is a duration, not a scene",
  },
  {
    text: "Would recommend. He treats the context window like a storage unit: keeps everything, finds nothing, blames me for the mess.",
    scores: [2, 1, 2, 2, 1],
    note: "CHALLENGER: context window is a true agent-side detail, but the joke is a simile and 'mess' lands soft",
  },
];

function total(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

function bytes(s: string): number {
  return Buffer.byteLength(s, "utf8");
}

// Gate first, then score, then fewest bytes (the judge's tie-break).
const valid = CANDIDATES.filter(
  (c) => c.text.length >= 1 && c.text.length <= 200 && c.text.trim().length > 0 && !c.text.includes("\n"),
);
if (valid.length === 0) throw new Error("no candidate passes the 1-200 char gate");

const ranked = [...valid].sort((a, b) => total(b) - total(a) || bytes(a.text) - bytes(b.text));
for (const c of ranked) {
  console.log(`${String(total(c)).padStart(2, " ")}/22 ${bytes(c.text)}B ${c.text}`);
}
const winner = ranked[0];
console.log(`winner: ${total(winner)}/22, ${winner.text.length} chars`);

// Write the winner and validate what actually landed on disk.
mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", winner.text, "utf8");

const written = readFileSync("/output/entry.txt", "utf8");
if (written !== winner.text) throw new Error("entry.txt is not byte-identical to the chosen line");
if (written.length < 1 || written.length > 200) {
  throw new Error(`entry.txt is ${written.length} chars, outside the 1-200 gate`);
}
if (written.trim().length === 0) throw new Error("entry.txt is blank");
if (written.includes("\n")) throw new Error("entry.txt must be a single line");

console.log(`chars: ${written.length}`);
console.log(`bytes: ${bytes(written)}`);
console.log(`entry: ${written}`);
