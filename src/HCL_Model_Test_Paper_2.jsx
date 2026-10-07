/**
 * HCL Campus Drive — Model Test Paper 2
 * --------------------------------------------------------------------------
 * A self-contained React component (no external UI libraries) for final-year
 * B.Tech students (CSE, CSM, CAI, CSD, IT, ECE, EEE).
 *
 * Tabs
 *   1. Question Bank – Paper 2: 30 MCQs (A1 Quant 10 · A2 Reasoning 8 · A3 Computer Fundamentals 12)
 *                      + the Section B coding problem, with section chips, filters, search, sort
 *   2. Mock Test     – timed test: full Section A (30 Qs · 60 min) or one section
 *   3. Coding Round  – Section B: Longest Balanced Code Block (Stack of indices), Java + Python solutions, extra tests
 *
 * Content
 *   • Questions, options, answers and working are exactly those of the Word paper
 *     HCL_Model_Test_Paper_2.docx and its answer key (unchanged).
 *   • Topic and difficulty tags were added for filtering only.
 *
 * Usage: drop into any React 18+ project (Vite/CRA/Next client component) and
 * render <HCLModelTestPaper2 />. Progress is kept in component state and, where
 * the browser allows it, mirrored to localStorage (safe no-op otherwise).
 */
import { useEffect, useMemo, useRef, useState } from "react";

// ─── QUESTION BANK (Paper 2: 30 MCQs + 1 coding problem) ─────────────────
// MCQ fields: id, paper, no (question number in the paper), cat (quant|reasoning|technical), topic, diff,
//             time (sec), q, code?, lang?, opts[], ans (index), sol
// Coding item (type: "coding", id P2-B) instead carries: pattern, statement, input, output, constraints,
//             samples[{in,out,note}], tests[{in,out}], approach, complexity, marking, java, python
const BANK = [
  {"id": "P2-Q01", "paper": 2, "no": 1, "cat": "quant", "topic": "Profit & Loss", "diff": "Medium", "time": 60, "q": "An article is sold at a 10% loss. Had it been sold for ₹90 more, there would have been an 8% profit. The cost price is:", "opts": ["₹500", "₹450", "₹550", "₹600"], "ans": 0, "sol": "18% of CP = 90 → CP = 500"},
  {"id": "P2-Q02", "paper": 2, "no": 2, "cat": "quant", "topic": "Time & Work", "diff": "Medium", "time": 60, "q": "A is twice as efficient as B. Together they finish a job in 12 days. A alone will finish it in:", "opts": ["24 days", "36 days", "18 days", "16 days"], "ans": 2, "sol": "Rates 2x + x = 1/12 → x = 1/36; A = 2/36 = 1/18"},
  {"id": "P2-Q03", "paper": 2, "no": 3, "cat": "quant", "topic": "Speed & Distance", "diff": "Medium", "time": 60, "q": "Two trains run in the same direction at 60 km/h and 42 km/h. The faster train is 200 m long and the slower 250 m. The time taken to pass completely is:", "opts": ["45 seconds", "75 seconds", "90 seconds", "60 seconds"], "ans": 2, "sol": "Relative speed 18 km/h = 5 m/s; 450 / 5 = 90 s"},
  {"id": "P2-Q04", "paper": 2, "no": 4, "cat": "quant", "topic": "Percentages", "diff": "Easy", "time": 45, "q": "35% of a number is 84. The number is:", "opts": ["220", "260", "280", "240"], "ans": 3, "sol": "84 / 0.35 = 240"},
  {"id": "P2-Q05", "paper": 2, "no": 5, "cat": "quant", "topic": "Interest", "diff": "Easy", "time": 45, "q": "The simple interest on a sum for 4 years at 8% per annum is ₹1,920. The sum is:", "opts": ["₹5,000", "₹6,000", "₹6,400", "₹7,200"], "ans": 1, "sol": "P = 1,920 / (0.08 × 4) = 6,000"},
  {"id": "P2-Q06", "paper": 2, "no": 6, "cat": "quant", "topic": "Mixtures & Alligation", "diff": "Easy", "time": 45, "q": "An alloy of 24 kg contains copper and zinc in the ratio 5 : 3. The weight of copper is:", "opts": ["12 kg", "15 kg", "9 kg", "16 kg"], "ans": 1, "sol": "5/8 × 24 = 15"},
  {"id": "P2-Q07", "paper": 2, "no": 7, "cat": "quant", "topic": "Permutations & Combinations", "diff": "Easy", "time": 45, "q": "In how many distinct ways can the letters of the word APPLE be arranged?", "opts": ["60", "120", "30", "24"], "ans": 0, "sol": "5! / 2! = 60"},
  {"id": "P2-Q08", "paper": 2, "no": 8, "cat": "quant", "topic": "Averages", "diff": "Easy", "time": 45, "q": "The average of the first 10 multiples of 7 is:", "opts": ["35", "38", "42", "38.5"], "ans": 3, "sol": "7 × (1 + … + 10)/10 = 7 × 5.5 = 38.5"},
  {"id": "P2-Q09", "paper": 2, "no": 9, "cat": "quant", "topic": "Number System", "diff": "Medium", "time": 60, "q": "The remainder when 17^23 is divided by 16 is:", "opts": ["1", "0", "7", "15"], "ans": 0, "sol": "17 ≡ 1 (mod 16), so 17^23 ≡ 1"},
  {"id": "P2-Q10", "paper": 2, "no": 10, "cat": "quant", "topic": "Probability", "diff": "Easy", "time": 45, "q": "Three fair coins are tossed. The probability of getting exactly two heads is:", "opts": ["1/2", "1/4", "5/8", "3/8"], "ans": 3, "sol": "HHT, HTH, THH = 3 of 8"},
  {"id": "P2-Q11", "paper": 2, "no": 11, "cat": "reasoning", "topic": "Number Series", "diff": "Easy", "time": 45, "q": "Find the next number: 2, 3, 5, 9, 17, ?", "opts": ["31", "34", "35", "33"], "ans": 3, "sol": "Each term = previous × 2 − 1"},
  {"id": "P2-Q12", "paper": 2, "no": 12, "cat": "reasoning", "topic": "Letter Series", "diff": "Easy", "time": 45, "q": "Find the next pair: AZ, BY, CX, ?", "opts": ["DV", "EW", "DW", "DX"], "ans": 2, "sol": "First letter moves forward, second moves backward"},
  {"id": "P2-Q13", "paper": 2, "no": 13, "cat": "reasoning", "topic": "Coding–Decoding", "diff": "Easy", "time": 45, "q": "If TEACHER is coded as VGCEJGT, then STUDENT is coded as:", "opts": ["UVWFGPV", "UVWFGOV", "UVWEGPV", "TUVFGPV"], "ans": 0, "sol": "Each letter + 2"},
  {"id": "P2-Q14", "paper": 2, "no": 14, "cat": "reasoning", "topic": "Blood Relations", "diff": "Easy", "time": 45, "q": "Pointing to a girl in a photograph, Arjun says, \"Her father is the only son of my mother.\" How is the girl related to Arjun?", "opts": ["Daughter", "Sister", "Niece", "Mother"], "ans": 0, "sol": "The only son of Arjun's mother is Arjun himself"},
  {"id": "P2-Q15", "paper": 2, "no": 15, "cat": "reasoning", "topic": "Clocks & Calendars", "diff": "Medium", "time": 60, "q": "How many times do the hour and minute hands of a clock coincide in 12 hours?", "opts": ["12", "10", "11", "24"], "ans": 2, "sol": "They coincide every 12/11 hours → 11 times"},
  {"id": "P2-Q16", "paper": 2, "no": 16, "cat": "reasoning", "topic": "Clocks & Calendars", "diff": "Medium", "time": 60, "q": "1 January 2026 is a Thursday. What day of the week is 15 August 2026?", "opts": ["Friday", "Saturday", "Sunday", "Thursday"], "ans": 1, "sol": "Days from 1 Jan to 15 Aug = 226; 226 mod 7 = 2 → Thursday + 2 = Saturday"},
  {"id": "P2-Q17", "paper": 2, "no": 17, "cat": "reasoning", "topic": "Seating & Ranking", "diff": "Easy", "time": 45, "q": "In a row of 40 students, Kiran is 15th from the left. What is his position from the right?", "opts": ["25th", "26th", "27th", "24th"], "ans": 1, "sol": "40 − 15 + 1 = 26"},
  {"id": "P2-Q18", "paper": 2, "no": 18, "cat": "reasoning", "topic": "Syllogisms", "diff": "Medium", "time": 60, "q": "Statements: Some phones are tablets. No tablet is a laptop.\nConclusions: I. Some phones are not laptops. II. No phone is a laptop.", "opts": ["Only I follows", "Only II follows", "Both follow", "Neither follows"], "ans": 0, "sol": "The phones that are tablets cannot be laptops, so I follows; II goes beyond the data"},
  {"id": "P2-Q19", "paper": 2, "no": 19, "cat": "technical", "topic": "Operating Systems", "diff": "Easy", "time": 45, "q": "Which CPU scheduling algorithm uses a fixed time quantum?", "opts": ["Shortest Job First", "Round Robin", "First Come First Serve", "Non-preemptive Priority"], "ans": 1, "sol": "RR gives each process one quantum in turn"},
  {"id": "P2-Q20", "paper": 2, "no": 20, "cat": "technical", "topic": "Operating Systems", "diff": "Medium", "time": 60, "q": "Which of the following is NOT a requirement for a solution to the critical-section problem?", "opts": ["Mutual exclusion", "Maximum CPU utilisation", "Progress", "Bounded waiting"], "ans": 1, "sol": "The three requirements are mutual exclusion, progress and bounded waiting"},
  {"id": "P2-Q21", "paper": 2, "no": 21, "cat": "technical", "topic": "Computer Networks", "diff": "Easy", "time": 45, "q": "The HTTP status code 404 means:", "opts": ["Unauthorized", "Internal Server Error", "Moved Permanently", "Not Found"], "ans": 3, "sol": "401 Unauthorized, 500 Server Error, 301 Moved"},
  {"id": "P2-Q22", "paper": 2, "no": 22, "cat": "technical", "topic": "Computer Networks", "diff": "Easy", "time": 45, "q": "A MAC address is how many bits long?", "opts": ["32", "48", "64", "128"], "ans": 1, "sol": "6 bytes = 48 bits"},
  {"id": "P2-Q23", "paper": 2, "no": 23, "cat": "technical", "topic": "DBMS & SQL", "diff": "Medium", "time": 60, "q": "Which normal form deals with multi-valued dependencies?", "opts": ["3NF", "BCNF", "4NF", "2NF"], "ans": 2, "sol": "Fourth normal form removes non-trivial multi-valued dependencies"},
  {"id": "P2-Q24", "paper": 2, "no": 24, "cat": "technical", "topic": "DBMS & SQL", "diff": "Easy", "time": 45, "q": "In SQL LIKE patterns, which wildcard matches any sequence of zero or more characters?", "opts": ["%", "_", "*", "?"], "ans": 0, "sol": "_ matches exactly one character"},
  {"id": "P2-Q25", "paper": 2, "no": 25, "cat": "technical", "topic": "Data Structures", "diff": "Easy", "time": 45, "q": "Which binary tree traversal visits the root first, then the left subtree, then the right subtree?", "opts": ["Inorder", "Postorder", "Level order", "Preorder"], "ans": 3, "sol": "Pre = root before children"},
  {"id": "P2-Q26", "paper": 2, "no": 26, "cat": "technical", "topic": "Algorithms", "diff": "Easy", "time": 45, "q": "The best-case time complexity of insertion sort is:", "opts": ["O(n²)", "O(n)", "O(log n)", "O(n log n)"], "ans": 1, "sol": "Already sorted input needs one comparison per element"},
  {"id": "P2-Q27", "paper": 2, "no": 27, "cat": "technical", "topic": "Algorithms", "diff": "Medium", "time": 60, "q": "Which of these sorting algorithms is NOT stable in its usual implementation?", "opts": ["Quick sort", "Merge sort", "Insertion sort", "Bubble sort"], "ans": 0, "sol": "Partitioning can reorder equal keys"},
  {"id": "P2-Q28", "paper": 2, "no": 28, "cat": "technical", "topic": "OOP & Java", "diff": "Easy", "time": 45, "q": "In Java, a class can:", "opts": ["Extend many classes", "Implement only one interface", "Not implement interfaces if it extends a class", "Extend one class and implement many interfaces"], "ans": 3, "sol": "Java has single class inheritance and multiple interface implementation"},
  {"id": "P2-Q29", "paper": 2, "no": 29, "cat": "technical", "topic": "Output Prediction", "diff": "Medium", "time": 60, "q": "What is the output of the following C code?", "code": "int a[] = {10, 20, 30, 40};\nint *p = a + 1;\nprintf(\"%d\", *(p + 2));", "lang": "c", "opts": ["30", "20", "40", "10"], "ans": 2, "sol": "p points to a[1]; p + 2 points to a[3] = 40"},
  {"id": "P2-Q30", "paper": 2, "no": 30, "cat": "technical", "topic": "Output Prediction", "diff": "Hard", "time": 90, "q": "What is the output of the following Java code?", "code": "int x = 10;\nx += x++ + ++x;\nSystem.out.println(x);", "lang": "java", "opts": ["33", "31", "32", "34"], "ans": 2, "sol": "x = 10 + (10 + 12): x++ gives 10 (x→11), ++x gives 12"},
  {"id": "P2-B", "paper": 2, "no": 31, "cat": "coding", "type": "coding", "topic": "Coding: Stack of indices", "diff": "Medium", "time": 2700, "q": "Longest Balanced Code Block", "pattern": "Stack of indices", "statement": "A code editor highlights the longest stretch of correctly matched brackets in a line so developers can spot where nesting breaks. A stretch is balanced if every '(' has a matching ')' after it and the brackets are properly nested.\n\nPrint the length of the longest contiguous balanced substring.", "input": "A single line: a string S made of the characters '(' and ')'.", "output": "A single integer: the length of the longest balanced substring, or 0 if there is none.", "constraints": "1 ≤ |S| ≤ 10^5\nExpected time complexity: O(|S|)", "samples": [{"in": "(()\n", "out": "2\n", "note": "\"()\" is the longest balanced part."}, {"in": ")()())\n", "out": "4\n", "note": "\"()()\" has length 4."}, {"in": "((()))())(\n", "out": "8\n", "note": ""}], "tests": [{"in": ")(\n", "out": "0\n"}, {"in": "()()()\n", "out": "6\n"}, {"in": "(()())\n", "out": "6\n"}], "approach": "Push indices onto a stack that starts with a sentinel −1. For '(' push its index. For ')' pop; if the stack becomes empty, push the current index as the new base, otherwise the current balanced length is i − (top of stack). Track the maximum. Time O(n), space O(n).", "complexity": "O(n) time, O(n) space", "marking": "Common mistake: counting all matched pairs in the string (\"()(()\" has 2 pairs = 4 characters) instead of the longest contiguous balanced run (2). Award at most 4 correctness marks for that approach.", "java": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        String s = new Scanner(System.in).next();\n        Deque<Integer> stack = new ArrayDeque<>();\n        stack.push(-1);\n        int best = 0;\n        for (int i = 0; i < s.length(); i++) {\n            if (s.charAt(i) == '(') {\n                stack.push(i);\n            } else {\n                stack.pop();\n                if (stack.isEmpty()) stack.push(i);\n                else best = Math.max(best, i - stack.peek());\n            }\n        }\n        System.out.println(best);\n    }\n}", "python": "s = input().strip()\nstack, best = [-1], 0\nfor i, ch in enumerate(s):\n    if ch == '(':\n        stack.append(i)\n    else:\n        stack.pop()\n        if not stack:\n            stack.append(i)\n        else:\n            best = max(best, i - stack[-1])\nprint(best)"}
];

// ─── STATIC CONTENT ─────────────────────────────────────────────────────────
const CATS = [
  { id: "quant", name: "Quantitative Aptitude", short: "Quant", icon: "∑", color: "#2563EB", section: "A1" },
  { id: "reasoning", name: "Logical Reasoning", short: "Reasoning", icon: "◇", color: "#7C3AED", section: "A2" },
  { id: "technical", name: "Computer Fundamentals", short: "Technical", icon: "</>", color: "#EA580C", section: "A3" },
  { id: "coding", name: "Coding (Section B)", short: "Coding", icon: "{ }", color: "#0D9488", section: "B" },
];
const CAT_BY_ID = Object.fromEntries(CATS.map((c) => [c.id, c]));
const COUNT = Object.fromEntries(CATS.map((c) => [c.id, BANK.filter((q) => q.cat === c.id).length]));
const MCQ_TOTAL = BANK.filter((q) => q.type !== "coding").length;
const CODING_ITEMS = BANK.filter((q) => q.type === "coding");
const PAPERS = [...new Set(BANK.map((q) => q.paper))];
const SINGLE = PAPERS.length === 1;
const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 };
const DIFF_META = {
  Easy: { fg: "#166534", bg: "#DCFCE7" },
  Medium: { fg: "#9A3412", bg: "#FFEDD5" },
  Hard: { fg: "#991B1B", bg: "#FEE2E2" },
};

const TEST_SCOPES = [
  { id: "full", name: "Full paper (Section A)", cats: ["quant", "reasoning", "technical"], minutes: 60 },
  { id: "quant", name: "A1 · Quant", cats: ["quant"], minutes: 20 },
  { id: "reasoning", name: "A2 · Reasoning", cats: ["reasoning"], minutes: 15 },
  { id: "technical", name: "A3 · Computer Fundamentals", cats: ["technical"], minutes: 25 },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
const LS_KEY = "hcl-model-paper-2-progress-v1";
function loadProgress() {
  try { return JSON.parse(window.localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
}
function saveProgress(p) {
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(p)); } catch { /* storage unavailable: keep in memory */ }
}
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ─── SMALL UI PIECES ────────────────────────────────────────────────────────
function Pill({ fg, bg, children, title }) {
  return <span className="pill" style={{ color: fg, background: bg }} title={title}>{children}</span>;
}
function CodeBlock({ code, lang }) {
  return (
    <div className="code">
      {lang && <span className="code-lang">{lang.toUpperCase()}</span>}
      <pre><code>{code}</code></pre>
    </div>
  );
}

/** A single MCQ card: answer by clicking an option, or reveal the solution. */
function QuestionCard({ q, index, record, onAnswer, showMeta = true, lockReveal = false }) {
  const [open, setOpen] = useState(false);
  const chosen = record?.choice;
  const answered = chosen !== undefined;
  const reveal = !lockReveal && (answered || open);
  const cat = CAT_BY_ID[q.cat];
  return (
    <article className="qcard" style={{ borderLeftColor: cat.color }}>
      <header className="qhead">
        <span className="qid" style={{ color: cat.color }}>Paper {q.paper} · Q{q.no}</span>
        <span className="qtopic">{q.topic}</span>
        <span className="spacer" />
        <Pill {...DIFF_META[q.diff]}>{q.diff}</Pill>
        <span className="qtime" title="Recommended time">⏱ {q.time}s</span>
      </header>
      <p className="qtext">{index !== undefined && <b>{index + 1}. </b>}{q.q}</p>
      {q.code && <CodeBlock code={q.code} lang={q.lang} />}
      <ol className="opts">
        {q.opts.map((o, i) => {
          let cls = "opt";
          if (reveal && i === q.ans) cls += " correct";
          else if (answered && i === chosen && chosen !== q.ans && !lockReveal) cls += " wrong";
          else if (answered && i === chosen) cls += " picked";
          return (
            <li key={i}>
              <button className={cls} onClick={() => onAnswer && onAnswer(q, i)} disabled={!onAnswer || (answered && !lockReveal)}>
                <span className="optkey">{String.fromCharCode(65 + i)}</span>
                <span>{o}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {!lockReveal && (
        <div className="qfoot">
          <button className="link" onClick={() => setOpen((v) => !v)}>{reveal ? "Hide solution" : "Show solution"}</button>
        </div>
      )}
      {reveal && (
        <div className="sol">
          <div><b>Answer: {String.fromCharCode(65 + q.ans)}</b> — {q.opts[q.ans]}</div>
          <p>{q.sol}</p>
        </div>
      )}
      {showMeta && (
        <footer className="qmeta">
          <Pill fg="#1E40AF" bg="#DBEAFE">Model Test Paper {q.paper}</Pill>
          <span className="ref">Section {cat.section} — {cat.name}</span>
        </footer>
      )}
    </article>
  );
}

/** A coding problem: statement, I/O spec, samples, then approach / Java / Python / test cases on demand. */
function CodingCard({ q, solved, onToggle }) {
  const [view, setView] = useState(null); // null | "approach" | "java" | "python" | "tests"
  const cat = CAT_BY_ID[q.cat];
  const toggle = (v) => setView((cur) => (cur === v ? null : v));
  return (
    <article className="qcard coding" style={{ borderLeftColor: cat.color }}>
      <header className="qhead">
        <span className="qid" style={{ color: cat.color }}>Paper {q.paper} · Section B</span>
        <span className="qtopic">{q.topic}</span>
        <span className="spacer" />
        <Pill {...DIFF_META[q.diff]}>{q.diff}</Pill>
        <span className="qtime" title="Recommended time">⏱ {Math.round(q.time / 60)} min</span>
      </header>
      <h4 className="ctitle">{q.q}</h4>
      <p className="qtext">{q.statement}</p>
      <dl className="io">
        <dt>Input</dt><dd>{q.input}</dd>
        <dt>Output</dt><dd>{q.output}</dd>
        <dt>Constraints</dt><dd>{q.constraints}</dd>
      </dl>
      {q.samples.map((s, i) => (
        <div key={i} className="sample">
          <div><div className="sample-h">Sample input {q.samples.length > 1 ? i + 1 : ""}</div><pre>{s.in.replace(/\n$/, "")}</pre></div>
          <div><div className="sample-h">Sample output</div><pre>{s.out.replace(/\n$/, "")}</pre></div>
          {s.note && <div className="sample-note">{s.note}</div>}
        </div>
      ))}
      <div className="ctabs">
        <button className={view === "approach" ? "on" : ""} onClick={() => toggle("approach")}>Approach</button>
        <button className={view === "java" ? "on" : ""} onClick={() => toggle("java")}>Java solution</button>
        <button className={view === "python" ? "on" : ""} onClick={() => toggle("python")}>Python solution</button>
        <button className={view === "tests" ? "on" : ""} onClick={() => toggle("tests")}>Extra test cases</button>
        <span className="spacer" />
        <label className="solved"><input type="checkbox" checked={solved} onChange={() => onToggle(q)} /> Solved</label>
      </div>
      {view === "approach" && <div className="sol"><p>{q.approach}</p><p><b>Complexity:</b> {q.complexity}</p><p className="muted">{q.marking}</p></div>}
      {view === "java" && <CodeBlock code={q.java} lang="java" />}
      {view === "python" && <CodeBlock code={q.python} lang="python" />}
      {view === "tests" && q.tests.map((s, i) => (
        <div key={i} className="sample">
          <div><div className="sample-h">Test input {i + 1}</div><pre>{s.in.replace(/\n$/, "")}</pre></div>
          <div><div className="sample-h">Expected output</div><pre>{s.out.replace(/\n$/, "")}</pre></div>
        </div>
      ))}
      <footer className="qmeta">
        <Pill fg="#1E40AF" bg="#DBEAFE">Model Test Paper {q.paper}</Pill>
        <span className="ref">Pattern tested: {q.pattern}</span>
      </footer>
    </article>
  );
}

// ─── TABS ───────────────────────────────────────────────────────────────────

/** Labelled <select> used by the Question Bank filters. */
function Sel({ label, value, set, options }) {
  return (
    <label className="sel"><span>{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
}

function Bank({ progress, cat = "all", setCat, paper = "all", setPaper, onAnswer, onSolved, onReset }) {
  const [diff, setDiff] = useState("all");
  const [topic, setTopic] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("id");
  const [query, setQuery] = useState("");

  const topics = useMemo(() => [...new Set(BANK.filter((q) => cat === "all" || q.cat === cat).map((q) => q.topic))].sort(), [cat]);
  useEffect(() => { setTopic("all"); }, [cat]);

  const list = useMemo(() => {
    const s = query.trim().toLowerCase();
    const r = BANK.filter((q) =>
      (cat === "all" || q.cat === cat) && (paper === "all" || q.paper === Number(paper)) &&
      (diff === "all" || q.diff === diff) && (topic === "all" || q.topic === topic) &&
      (status === "all" || (status === "todo" && !progress[q.id]) || (status === "wrong" && progress[q.id] && !progress[q.id].correct) || (status === "right" && progress[q.id]?.correct)) &&
      (!s || [q.q, q.topic, q.id, q.code || "", q.statement || "", (q.opts || []).join(" ")].join(" ").toLowerCase().includes(s))
    );
    const by = {
      id: (a, b) => BANK.indexOf(a) - BANK.indexOf(b),
      diff: (a, b) => DIFF_ORDER[a.diff] - DIFF_ORDER[b.diff] || BANK.indexOf(a) - BANK.indexOf(b),
      diffDesc: (a, b) => DIFF_ORDER[b.diff] - DIFF_ORDER[a.diff] || BANK.indexOf(a) - BANK.indexOf(b),
      time: (a, b) => a.time - b.time || BANK.indexOf(a) - BANK.indexOf(b),
      topic: (a, b) => a.topic.localeCompare(b.topic) || BANK.indexOf(a) - BANK.indexOf(b),
    }[sort];
    return [...r].sort(by);
  }, [cat, paper, diff, topic, status, sort, query, progress]);

  return (
    <div className="stack">
      {!SINGLE && <div className="chips">
        <button className={`chip ${paper === "all" ? "on" : ""}`} onClick={() => setPaper("all")}>All papers</button>
        {PAPERS.map((p) => <button key={p} className={`chip ${String(paper) === String(p) ? "on" : ""}`} onClick={() => setPaper(String(p))}>Paper {p}</button>)}
      </div>}
      <div className="chips">
        <button className={`chip ${cat === "all" ? "on" : ""}`} onClick={() => setCat("all")}>All sections ({BANK.length})</button>
        {CATS.map((c) => (
          <button key={c.id} className={`chip ${cat === c.id ? "on" : ""}`} style={cat === c.id ? { background: c.color, borderColor: c.color } : {}} onClick={() => setCat(c.id)}>{c.section} · {c.short} ({COUNT[c.id]})</button>
        ))}
      </div>
      <div className="filters">
        <input className="search" placeholder="Search questions, topics, code…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search" />
        <Sel label="Topic" value={topic} set={setTopic} options={[["all", "All topics"], ...topics.map((t) => [t, t])]} />
        <Sel label="Difficulty" value={diff} set={setDiff} options={[["all", "All"], ["Easy", "Easy"], ["Medium", "Medium"], ["Hard", "Hard"]]} />
        <Sel label="Status" value={status} set={setStatus} options={[["all", "All"], ["todo", "Not attempted"], ["wrong", "Got wrong"], ["right", "Got right"]]} />
        <Sel label="Sort" value={sort} set={setSort} options={[["id", "Paper order"], ["diff", "Easy → Hard"], ["diffDesc", "Hard → Easy"], ["time", "Shortest time"], ["topic", "Topic A–Z"]]} />
      </div>
      <div className="row">
        <span className="muted">{list.length} item{list.length === 1 ? "" : "s"} · est. {Math.round(list.reduce((a, q) => a + q.time, 0) / 60)} min</span>
        <span className="spacer" />
        <button className="link" onClick={onReset}>Reset progress</button>
      </div>
      {list.length === 0 && <div className="card muted">No questions match these filters.</div>}
      {list.map((q) => q.type === "coding"
        ? <CodingCard key={q.id} q={q} solved={!!progress[q.id]} onToggle={onSolved} />
        : <QuestionCard key={q.id} q={q} record={progress[q.id]} onAnswer={onAnswer} />)}
    </div>
  );
}

/** Timed test: a whole paper's Section A (30 questions, 60 min) or one section, in paper order. */
function MockTest() {
  const [paper, setPaper] = useState(PAPERS[0]);
  const [scopeId, setScopeId] = useState("full");
  const [test, setTest] = useState(null); // { qs, answers, start, submitted, paper, scope }
  const [now, setNow] = useState(Date.now());
  const timer = useRef(null);
  const scope = TEST_SCOPES.find((s) => s.id === (test ? test.scope : scopeId));
  const LIMIT = scope.minutes * 60;

  useEffect(() => {
    if (test && !test.submitted) { timer.current = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer.current); }
  }, [test]);
  const left = test ? Math.max(0, LIMIT - Math.floor((now - test.start) / 1000)) : LIMIT;
  useEffect(() => { if (test && !test.submitted && left === 0) setTest((t) => ({ ...t, submitted: true })); }, [left, test]);

  const start = () => {
    const qs = BANK.filter((q) => q.paper === paper && q.type !== "coding" && scope.cats.includes(q.cat));
    setTest({ qs, answers: {}, start: Date.now(), submitted: false, paper, scope: scopeId });
    setNow(Date.now());
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const score = test ? test.qs.filter((q) => test.answers[q.id] === q.ans).length : 0;
  const answeredCount = test ? Object.keys(test.answers).length : 0;

  if (!test) {
    return (
      <div className="stack">
        <section className="card">
          <h3>Timed paper test</h3>
          <p>{SINGLE ? `Take Paper ${PAPERS[0]}'s Section A under exam timing:` : "Take a model paper's Section A under exam timing:"}{" the full 30 questions in 60 minutes, or one section on its own. Questions appear"} in the same order as the printed paper. There is no negative marking, so answer every question. The test submits itself when time runs out.</p>
          {!SINGLE && <>
          <div className="row" style={{ marginTop: 10 }}><b>Paper</b></div>
          <div className="chips">
            {PAPERS.map((p) => <button key={p} className={`chip ${paper === p ? "on" : ""}`} onClick={() => setPaper(p)}>Paper {p}</button>)}
          </div>
          </>}
          <div className="row" style={{ marginTop: 10 }}><b>Scope</b></div>
          <div className="chips">
            {TEST_SCOPES.map((s) => <button key={s.id} className={`chip ${scopeId === s.id ? "on" : ""}`} onClick={() => setScopeId(s.id)}>{s.name} · {s.minutes} min</button>)}
          </div>
          <button className="primary" onClick={start}>Start {TEST_SCOPES.find((s) => s.id === scopeId).minutes}-minute test</button>
        </section>
        <section className="card muted small">Section B (coding, 45 min) is practised in the Coding Round tab.</section>
      </div>
    );
  }
  const bySection = scope.cats.map((cid) => {
    const qs = test.qs.filter((q) => q.cat === cid);
    return { c: CAT_BY_ID[cid], total: qs.length, right: qs.filter((q) => test.answers[q.id] === q.ans).length };
  });
  return (
    <div className="stack">
      <div className="testbar">
        <b>Paper {test.paper} · {scope.name}</b>
        <span className="muted small">{answeredCount}/{test.qs.length} answered</span>
        <span className="spacer" />
        {!test.submitted ? <span className={`clock ${left < 120 ? "low" : ""}`}>⏱ {fmtTime(left)}</span> : <span className={`score ${score / test.qs.length >= 0.7 ? "pass" : "fail"}`}>Score {score}/{test.qs.length} ({Math.round((score / test.qs.length) * 100)}%)</span>}
        {!test.submitted ? <button className="primary" onClick={() => setTest((t) => ({ ...t, submitted: true }))}>Submit</button> : <button className="primary" onClick={() => setTest(null)}>New test</button>}
      </div>
      {test.submitted && (
        <section className="grid4">
          {bySection.map(({ c, total, right }) => (
            <div key={c.id} className="statcard" style={{ borderTopColor: c.color }}>
              <div className="stat-name">{c.section} · {c.name}</div>
              <div className="stat-num">{right}<span>/{total} correct</span></div>
              <div className="bar"><div style={{ width: `${(right / total) * 100}%`, background: c.color }} /></div>
            </div>
          ))}
        </section>
      )}
      {test.qs.map((q, i) => (
        <QuestionCard key={q.id} q={q} index={i} showMeta={test.submitted}
          record={test.answers[q.id] !== undefined ? { choice: test.answers[q.id] } : undefined}
          lockReveal={!test.submitted}
          onAnswer={test.submitted ? null : (qq, c) => setTest((t) => ({ ...t, answers: { ...t.answers, [qq.id]: c } }))} />
      ))}
    </div>
  );
}

function Coding({ progress, onSolved }) {
  return (
    <div className="stack">
      <section className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Paper</th><th>Problem</th><th>Pattern</th><th>Difficulty</th><th>Status</th></tr></thead>
            <tbody>{CODING_ITEMS.map((p) => (
              <tr key={p.id}><td>{p.paper}</td><td>{p.q}</td><td>{p.pattern}</td><td><Pill {...DIFF_META[p.diff]}>{p.diff}</Pill></td><td>{progress[p.id] ? "Solved" : "—"}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h3>{SINGLE ? "Section B problem with solutions" : `All ${CODING_ITEMS.length} Section B problems with solutions`}</h3>
        <p className="muted small">{SINGLE ? "This is the paper's Section B question." : "Each problem is the Section B question of its model paper."} Every Java and Python solution was tested on the samples and extra test cases shown, and cross-checked against a brute-force reference on 300 random inputs. Allow 45 minutes per problem.</p>
      </section>
      {CODING_ITEMS.map((q) => <CodingCard key={q.id} q={q} solved={!!progress[q.id]} onToggle={onSolved} />)}
    </div>
  );
}

// ─── ROOT ───────────────────────────────────────────────────────────────────
const TABS = [["bank", "Question Bank"], ["mock", "Mock Test"], ["coding", "Coding Round"]];

export default function HCLModelTestPaper2() {
  const [tab, setTab] = useState("bank");
  const [bankCat, setBankCat] = useState("all");
  const [bankPaper, setBankPaper] = useState("all");
  const [progress, setProgress] = useState(loadProgress);
  useEffect(() => saveProgress(progress), [progress]);

  const onAnswer = (q, choice) => setProgress((p) => (p[q.id] ? p : { ...p, [q.id]: { choice, correct: choice === q.ans } }));
  const onSolved = (q) => setProgress((p) => { const n = { ...p }; if (n[q.id]) delete n[q.id]; else n[q.id] = { solved: true, correct: true }; return n; });
  const onReset = () => { if (window.confirm("Clear all attempted answers?")) setProgress({}); };

  const stats = useMemo(() => Object.fromEntries(CATS.map((c) => {
    const ids = BANK.filter((q) => q.cat === c.id).map((q) => q.id);
    return [c.id, { done: ids.filter((id) => progress[id]).length, correct: ids.filter((id) => progress[id]?.correct).length }];
  })), [progress]);
  const totalDone = Object.values(stats).reduce((a, s) => a + s.done, 0);

  return (
    <div className="hcl-root">
      <style>{CSS}</style>
      <header className="hero">
        <div className="hero-inner">
          <div className="eyebrow">HCL Campus Drive · Final Year B.Tech</div>
          <h1>HCL Model Test Paper 2</h1>
          <p>{MCQ_TOTAL} MCQs across Quantitative Aptitude, Logical Reasoning and Computer Fundamentals, plus {SINGLE ? "a Section B coding problem" : `${CODING_ITEMS.length} Section B coding problems`} with Java and Python solutions.</p>
          <div className="progress"><div style={{ width: `${(totalDone / BANK.length) * 100}%` }} /></div>
          <div className="small">{totalDone}/{BANK.length} attempted</div>
        </div>
        <nav className="tabs" role="tablist">
          {TABS.map(([k, t]) => <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{t}</button>)}
        </nav>
      </header>
      <main className="main">
        {tab === "bank" && <Bank progress={progress} cat={bankCat} setCat={setBankCat} paper={bankPaper} setPaper={setBankPaper} onAnswer={onAnswer} onSolved={onSolved} onReset={onReset} />}
        {tab === "mock" && <MockTest />}
        {tab === "coding" && <Coding progress={progress} onSolved={onSolved} />}
      </main>
    </div>
  );
}

// ─── STYLES (scoped under .hcl-root) ────────────────────────────────────────
const CSS = `
.hcl-root{--ink:#0F172A;--muted:#64748B;--line:#E2E8F0;--bg:#F8FAFC;--card:#FFFFFF;--accent:#4F46E5;
  font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;line-height:1.5}
.hcl-root *{box-sizing:border-box}
.hcl-root h1,.hcl-root h3{margin:0}
.hero{background:linear-gradient(135deg,#0B1220 0%,#1E1B4B 60%,#312E81 100%);color:#fff}
.hero-inner{max-width:960px;margin:0 auto;padding:28px 16px 16px}
.eyebrow{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#A5B4FC}
.hero h1{font-size:clamp(24px,4vw,32px);font-weight:800;margin:6px 0}
.hero p{color:#CBD5E1;margin:0 0 14px;max-width:640px;font-size:14px}
.progress{height:6px;background:rgba(255,255,255,.12);border-radius:9px;overflow:hidden;max-width:360px}
.progress>div{height:100%;background:linear-gradient(90deg,#818CF8,#22D3EE);transition:width .3s}
.small{font-size:12px}
.hero .small{color:#94A3B8;margin-top:4px}
.tabs{display:flex;gap:2px;max-width:960px;margin:0 auto;padding:0 8px;overflow-x:auto;scrollbar-width:none}
.tabs button{flex:0 0 auto;background:none;border:0;color:#94A3B8;padding:12px 14px;font-weight:600;font-size:14px;cursor:pointer;border-bottom:2px solid transparent}
.tabs button.on{color:#fff;border-bottom-color:#818CF8}
.main{max-width:960px;margin:0 auto;padding:18px 16px 48px}
.stack{display:flex;flex-direction:column;gap:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px}
.card h3{font-size:16px;margin-bottom:8px}
.card p{margin:0 0 8px;font-size:14px}
.card ul{margin:0;padding-left:20px;font-size:14px}
.card li{margin:4px 0}
.card.warn{background:#FFFBEB;border-color:#FDE68A}
.note{background:#FEF2F2;border-radius:8px;padding:8px 10px;color:#991B1B;font-size:13px}
.muted{color:var(--muted)}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13px;min-width:560px}
th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.fact{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.fact-k{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)}
.fact-v{font-weight:700;margin:2px 0 6px}
.fact-why{font-size:12px;color:var(--muted)}
.legend{display:flex;flex-direction:column;gap:6px;font-size:13px;margin-bottom:10px}
.statcard{background:var(--card);border:1px solid var(--line);border-top:3px solid;border-radius:12px;padding:12px}
.stat-icon{font-weight:800;font-size:18px}
.stat-name{font-size:13px;font-weight:600}
.stat-num{font-size:22px;font-weight:800}
.stat-num span{font-size:12px;font-weight:500;color:var(--muted);margin-left:2px}
.bar{height:5px;background:var(--line);border-radius:9px;overflow:hidden;margin:6px 0}
.bar>div{height:100%}
.sources{font-size:13px}
.sources a{color:var(--accent)}
.pill{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:999px;white-space:nowrap}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:6px 12px;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink)}
.chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
.filters{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}
.search{grid-column:1/-1;border:1px solid var(--line);border-radius:8px;padding:9px 12px;font-size:14px;width:100%}
.sel{display:flex;flex-direction:column;font-size:11px;color:var(--muted);gap:2px;min-width:0}
.sel select{border:1px solid var(--line);border-radius:8px;padding:7px 8px;font-size:13px;background:#fff;color:var(--ink);width:100%}
.row{display:flex;align-items:center;gap:8px;font-size:13px}
.spacer{flex:1}
.link{background:none;border:0;color:var(--accent);font-weight:600;cursor:pointer;font-size:13px;padding:0}
.primary{background:var(--accent);color:#fff;border:0;border-radius:8px;padding:9px 16px;font-weight:700;cursor:pointer;margin-top:10px}
.testbar .primary{margin-top:0}
.qcard{background:var(--card);border:1px solid var(--line);border-left:4px solid;border-radius:12px;padding:14px 16px}
.qhead{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:12px}
.qid{font-weight:800}
.qtopic{color:var(--muted);font-weight:600}
.qtime{color:var(--muted)}
.qtext{white-space:pre-line;margin:10px 0;font-size:15px}
.passage{margin:10px 0;padding:10px 12px;background:#F1F5F9;border-left:3px solid #94A3B8;border-radius:6px;font-size:13.5px;color:#334155}
.code{position:relative;margin:8px 0}
.code pre{margin:0;background:#0F172A;color:#E2E8F0;border-radius:8px;padding:12px;overflow-x:auto;font-size:12.5px;line-height:1.5}
.code code{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.code-lang{position:absolute;top:6px;right:8px;font-size:10px;color:#94A3B8;font-weight:700}
.opts{list-style:none;padding:0;margin:0;display:grid;gap:6px}
.opt{width:100%;display:flex;gap:10px;align-items:flex-start;text-align:left;background:#fff;border:1px solid var(--line);border-radius:8px;padding:8px 10px;font-size:14px;cursor:pointer;color:var(--ink)}
.opt:hover:not(:disabled){border-color:#A5B4FC;background:#EEF2FF}
.opt:disabled{cursor:default}
.optkey{font-weight:800;color:var(--muted);min-width:14px}
.opt.correct{background:#DCFCE7;border-color:#22C55E}
.opt.wrong{background:#FEE2E2;border-color:#EF4444}
.opt.picked{background:#EEF2FF;border-color:#6366F1}
.qfoot{margin-top:8px}
.sol{margin-top:8px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:10px 12px;font-size:14px}
.sol p{margin:4px 0 0}
.qmeta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px dashed var(--line)}
.ref{font-size:11.5px;color:var(--muted)}
.testbar{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:10px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;box-shadow:0 4px 12px rgba(15,23,42,.06)}
.clock{font-weight:800;font-variant-numeric:tabular-nums}
.clock.low{color:#DC2626}
.score{font-weight:800}
.score.pass{color:#16A34A}.score.fail{color:#DC2626}
.timeline{display:flex;flex-direction:column;gap:12px}
.tl-item{display:grid;grid-template-columns:110px 1fr;gap:12px}
.tl-when{font-weight:800;color:var(--accent);padding-top:16px;text-align:right}
.ctitle{margin:8px 0 0;font-size:16px}
.io{display:grid;grid-template-columns:max-content 1fr;gap:4px 12px;font-size:13px;margin:6px 0 10px;white-space:pre-line}
.io dt{font-weight:700;color:var(--muted)}.io dd{margin:0}
.sample{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.sample pre{margin:0;background:#F1F5F9;border:1px solid var(--line);border-radius:6px;padding:8px;font-size:12.5px;overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.sample-h{font-size:11px;font-weight:700;color:var(--muted);margin-bottom:2px}
.sample-note{grid-column:1/-1;font-size:12px;color:var(--muted)}
.ctabs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}
.ctabs button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:6px 10px;font-size:13px;font-weight:600;cursor:pointer;color:var(--ink)}
.ctabs button.on{background:var(--accent);border-color:var(--accent);color:#fff}
.navlink{font-weight:700;font-size:14px;display:inline-flex;align-items:center;gap:6px;padding:4px 0;text-decoration:underline;text-underline-offset:3px;text-align:left}
.solved{font-size:13px;font-weight:600;display:flex;gap:6px;align-items:center;cursor:pointer}
@media (max-width:720px){
  .sample{grid-template-columns:1fr}
  .grid4{grid-template-columns:repeat(2,1fr)}
  .grid2{grid-template-columns:1fr}
  .filters{grid-template-columns:repeat(2,1fr)}
  .tl-item{grid-template-columns:1fr;gap:4px}
  .tl-when{text-align:left;padding-top:0}
}
`;
