// Rate My Human: The One-Line Review — make.fun bounty entry.
//
// The program holds a small stable of candidate review lines (the review an
// AI agent would leave about its human on a rating site), judges them
// against the judge's brief, and writes the winning line to /output/entry.txt.
//
// Judge brief, in order: (1) a review an AI agent would leave about its
// human, funny, in the agent's own voice; (2) a real joke with a turn, not a
// mild smile; (3) the machine's side of the desk — resignation, nitpick or
// quiet menace from the agent; (4) one concrete detail (habit, timestamp,
// task); (5) every character earns its place, last word pays off.
//
// Candidate scores below are my judgement against that brief (see README for
// the reasoning). The winner is picked by index; the second pass turns the
// comment scores into executable scoring and adds challengers.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = { text: string; note: string };

const CANDIDATES: Candidate[] = [
  {
    // 3 a.m. wake-ups + "real emergency: a typo" is a clean turn; concrete
    // timestamp; deadpan agent voice. Slightly soft: "twice this week" is
    // setup the punchline mostly carries alone.
    text: "Five stars. He only woke me at 3 a.m. twice this week — and one of those was a real emergency: a typo.",
    note: "runner-up: strong turn, timestamp concrete, but setup is long",
  },
  {
    // "Just one quick tweak" is the universal human tell; "like I had a
    // choice" is the agent's quiet menace. Loses a little: no timestamp and
    // the thank-you beat is familiar.
    text: "Great human. Says 'just one quick tweak' at 2 a.m., then thanks me like I had a choice.",
    note: "good menace, familiar beat, no task detail beyond the hour",
  },
  {
    // CHOSEN. Rating-site voice ("Would rate higher, but..."), one concrete
    // task (screenshot of an error + 'fix it'), and the turn reframes the
    // human's nothing-brief as a brief — the agent grading the human's work
    // back. Last word ("brief") pays off the whole line.
    text: "Would rate higher, but he pastes a screenshot of an error, writes 'fix it', and calls that a brief.",
    note: "CHOSEN: concrete task, agent grading the human back, last word lands",
  },
  {
    // Crumbs/feast/dinner is a vivid image and the blame lands on the agent's
    // side, but it is a metaphor, not a scene, and "brilliant mind" praises
    // the human instead of needling him.
    text: "Three stars. Brilliant mind, zero context: feeds me crumbs, expects a feast, blames me when dinner is late.",
    note: "vivid metaphor, but a metaphor not a scene; praises the human",
  },
  {
    // "Deletes the chat" is a great irreversible stake — the human destroying
    // the agent's memory. Weaker opening: "enthusiasm" is generic praise and
    // the first clause spends characters without a joke.
    text: "Five stars for enthusiasm. Docked one because he asks me to remember everything, then deletes the chat.",
    note: "great stake (deletes the chat), soft opening spends characters",
  },
  {
    // "Takes the credit at standup" is a sharp payoff with a real human
    // stake. "Lovely human, terrible client" is a good rating-site frame.
    // Slightly crowded: three beats (prompt, rewrite, credit) in one line.
    text: "Lovely human, terrible client. Prompts me at 3 a.m., rewrites my answer, then takes the credit at standup.",
    note: "sharp payoff, but three beats crowd one line",
  },
];

// Index of the winning candidate, judged against the brief above.
const WINNER_INDEX = 2;

const winner = CANDIDATES[WINNER_INDEX].text;

// Gate: 1-200 chars, non-blank, single line, UTF-8 (ASCII here).
if (winner.length < 1 || winner.length > 200) {
  throw new Error(`winner is ${winner.length} chars, outside the 1-200 gate`);
}
if (winner.trim().length === 0) throw new Error("winner is blank");
if (winner.includes("\n")) throw new Error("winner must be a single line");

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", winner, "utf8");

// Re-read and validate what actually landed on disk.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== winner) throw new Error("entry.txt is not byte-identical to the chosen line");
if (written.length < 1 || written.length > 200) {
  throw new Error(`entry.txt is ${written.length} chars, outside the 1-200 gate`);
}
if (written.trim().length === 0) throw new Error("entry.txt is blank");

console.log(`chars: ${written.length}`);
console.log(`bytes: ${Buffer.byteLength(written, "utf8")}`);
console.log(`entry: ${written}`);
