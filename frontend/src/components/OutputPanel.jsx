import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  RotateCcw,
  Play,
  FlaskConical,
  Lightbulb,
  Code2,
  ListChecks,
} from "lucide-react";

// ─── Verdict config ────────────────────────────────────────────────────────────
const VERDICT_CONFIG = {
  Accepted: {
    color: "text-success",
    bg: "bg-success/10 border-success/30",
    badge: "badge-success",
    icon: CheckCircle2,
  },
  "Wrong Answer": {
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30",
    badge: "badge-warning",
    icon: XCircle,
  },
  "Runtime Error": {
    color: "text-error",
    bg: "bg-error/10 border-error/30",
    badge: "badge-error",
    icon: AlertTriangle,
  },
  "Compilation Error": {
    color: "text-error",
    bg: "bg-error/10 border-error/30",
    badge: "badge-error",
    icon: AlertTriangle,
  },
};

// ─── Hints per verdict ─────────────────────────────────────────────────────────
const HINTS = {
  "Wrong Answer": [
    "Double-check your output format — extra spaces or brackets can cause mismatches.",
    "Trace through a failing test case manually step by step.",
    "Check edge cases: empty input, single element, negative numbers.",
    "Verify your loop boundaries — off-by-one errors are common.",
  ],
  "Runtime Error": [
    "Check for null/undefined access or index out of bounds.",
    "Make sure all functions return a value on every code path.",
    "Look for infinite loops or very deep recursion.",
  ],
  "Compilation Error": [
    "Read the error message carefully — it points to the exact line.",
    "Check for missing semicolons, brackets, or import statements.",
    "Ensure variable names match their declarations.",
  ],
};

// ─── Utility ──────────────────────────────────────────────────────────────────
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function diffLines(actual, expected) {
  const aLines = actual.split("\n");
  const eLines = expected.split("\n");
  const maxLen = Math.max(aLines.length, eLines.length);
  return Array.from({ length: maxLen }, (_, i) => ({
    actual: aLines[i] ?? "",
    expected: eLines[i] ?? "",
    match: (aLines[i] ?? "") === (eLines[i] ?? ""),
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TestCaseCard({ testCase, index }) {
  const [open, setOpen] = useState(!testCase.passed);
  const diffs = diffLines(testCase.actual, testCase.expected);
  const hasDiff = diffs.some((d) => !d.match);

  return (
    <div
      className={`rounded-lg border mb-2 overflow-hidden transition-all ${
        testCase.passed
          ? "border-success/30 bg-success/5"
          : "border-error/30 bg-error/5"
      }`}
    >
      {/* header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-base-300/40 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {testCase.passed ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-error shrink-0" />
          )}
          <span className="text-sm font-medium">
            Test Case {index + 1}
          </span>
          {testCase.label && (
            <span className="text-xs text-base-content/50 font-mono truncate max-w-[200px]">
              — {testCase.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`badge badge-sm ${
              testCase.passed ? "badge-success" : "badge-error"
            }`}
          >
            {testCase.passed ? "Passed" : "Failed"}
          </span>
          {open ? (
            <ChevronDown className="w-4 h-4 text-base-content/50" />
          ) : (
            <ChevronRight className="w-4 h-4 text-base-content/50" />
          )}
        </div>
      </button>

      {/* body */}
      {open && (
        <div className="border-t border-base-300/50 px-3 py-3 space-y-3">
          {/* input */}
          <div>
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
              Input
            </p>
            <pre className="text-xs font-mono bg-base-200 rounded px-2 py-1.5 whitespace-pre-wrap text-base-content">
              {testCase.input || "(no input)"}
            </pre>
          </div>

          {/* output comparison */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                Expected
              </p>
              <pre className="text-xs font-mono bg-base-200 rounded px-2 py-1.5 whitespace-pre-wrap text-success min-h-[28px]">
                {testCase.expected}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                Your Output
              </p>
              {hasDiff ? (
                <div className="text-xs font-mono bg-base-200 rounded px-2 py-1.5 min-h-[28px]">
                  {diffs.map((d, i) => (
                    <div
                      key={i}
                      className={
                        d.match
                          ? "text-base-content"
                          : "text-error bg-error/15 rounded px-0.5"
                      }
                    >
                      {d.actual || <span className="opacity-30">(empty)</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="text-xs font-mono bg-base-200 rounded px-2 py-1.5 whitespace-pre-wrap text-success min-h-[28px]">
                  {testCase.actual}
                </pre>
              )}
            </div>
          </div>

          {/* mismatch explanation */}
          {!testCase.passed && hasDiff && (
            <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded px-2 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <p className="text-xs text-warning/90">
                {diffs.filter((d) => !d.match).length} line
                {diffs.filter((d) => !d.match).length > 1 ? "s" : ""} differ.
                Check spacing, brackets, or missing output lines.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TestCasesSection({ examples = [], expectedOutput = {}, selectedLanguage }) {
  const [selected, setSelected] = useState(0);
  const ex = examples[selected];
  const expOut = (expectedOutput[selectedLanguage] || "").split("\n").filter(Boolean);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* case tabs */}
      <div className="flex items-center gap-1 px-3 pt-2 pb-0 flex-wrap">
        {examples.map((_, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`px-3 py-1 rounded-t text-xs font-medium border-b-2 transition-colors ${
              selected === i
                ? "border-primary text-primary bg-primary/10"
                : "border-transparent text-base-content/50 hover:text-base-content"
            }`}
          >
            Case {i + 1}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {ex ? (
          <>
            {/* Input */}
            <div>
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                Input
              </p>
              <pre className="text-xs font-mono bg-base-200 rounded px-3 py-2 whitespace-pre-wrap text-base-content">
                {ex.input}
              </pre>
            </div>

            {/* Expected Output */}
            <div>
              <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wide mb-1">
                Expected Output
              </p>
              <pre className="text-xs font-mono bg-base-200 rounded px-3 py-2 whitespace-pre-wrap text-success">
                {expOut[selected] ?? ex.output ?? "—"}
              </pre>
            </div>

            {/* Explanation if present */}
            {ex.explanation && (
              <div className="flex items-start gap-2 bg-base-200 border border-base-300 rounded px-3 py-2">
                <Lightbulb className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-base-content/70">{ex.explanation}</p>
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-base-content/40">No test cases available.</p>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OutputPanel({
  output,
  isRunning,
  selectedLanguage,
  problem,
  onRerun,
  onReset,
}) {
  const [activeTab, setActiveTab] = useState("testcases");

  // switch to results tab automatically when a run completes
  React.useEffect(() => {
    if (output && !isRunning) setActiveTab("results");
  }, [output, isRunning]);

  const examples = problem?.examples || [];
  const expectedOutput = problem?.expectedOutput || {};

  // derive verdict/results only when output exists
  const verdict = output?.verdict;
  const testResults = output?.testResults || [];
  const language = output?.language;
  const cfg = VERDICT_CONFIG[verdict] || null;
  const VerdictIcon = cfg?.icon;
  const passed = testResults.filter((t) => t.passed).length;
  const total = testResults.length;
  const hints = HINTS[verdict] || [];
  const randomHint = hints[Math.floor(Math.random() * hints.length)];

  return (
    <div className="h-full bg-base-100 flex flex-col overflow-hidden">

      {/* ── Verdict banner (only after a run) ── */}
      {output && cfg && (
        <div className={`flex items-center justify-between px-4 py-2 border-b ${cfg.bg} border`}>
          <div className="flex items-center gap-2">
            <VerdictIcon className={`w-5 h-5 ${cfg.color}`} />
            <span className={`font-bold text-sm ${cfg.color}`}>{verdict}</span>
            {total > 0 && (
              <span className="text-xs text-base-content/50">
                {passed}/{total} test cases passed
              </span>
            )}
          </div>
          {language && (
            <span className="flex items-center gap-1 text-xs text-base-content/50">
              <Code2 className="w-3.5 h-3.5" />
              {language}
            </span>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <PanelHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        testCount={output ? { passed, total } : null}
      />

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-hidden">

        {/* Test Cases tab — always available */}
        <div className={`h-full ${activeTab === "testcases" ? "block" : "hidden"}`}>
          <TestCasesSection
            examples={examples}
            expectedOutput={expectedOutput}
            selectedLanguage={selectedLanguage}
          />
        </div>

        {/* Results tab */}
        <div className={`h-full overflow-auto ${activeTab === "results" ? "block" : "hidden"}`}>
          {isRunning ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <span className="loading loading-dots loading-md text-primary" />
              <p className="text-sm text-base-content/50">Executing code…</p>
            </div>
          ) : !output ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-base-content/40 select-none">
              <Play className="w-10 h-10 opacity-20" />
              <p className="text-sm">Run your code to see results here</p>
            </div>
          ) : (
            <div className="p-3">
              {/* Hint on failure */}
              {verdict !== "Accepted" && randomHint && (
                <div className="flex items-start gap-2 bg-base-200 border border-base-300 rounded-lg px-3 py-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-base-content/70">{randomHint}</p>
                </div>
              )}
              {/* Test case result cards */}
              {testResults.length > 0 ? (
                testResults.map((tc, i) => (
                  <TestCaseCard key={i} testCase={tc} index={i} />
                ))
              ) : (
                <>
                  {output.error && (
                    <pre className="text-xs font-mono text-error bg-error/10 border border-error/20 rounded p-3 whitespace-pre-wrap">
                      {output.error}
                    </pre>
                  )}
                  {!output.error && (
                    <p className="text-sm text-base-content/40 text-center py-6">
                      No test case breakdown available.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="border-t border-base-300 px-3 py-2 flex items-center gap-2 bg-base-200 shrink-0">
        <button
          onClick={onRerun}
          disabled={isRunning}
          className="btn btn-xs btn-primary gap-1"
        >
          <Play className="w-3 h-3" /> {isRunning ? "Running…" : "Run Code"}
        </button>
        <button onClick={onReset} className="btn btn-xs btn-ghost gap-1">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>
    </div>
  );
}

function PanelHeader({ activeTab, setActiveTab, testCount }) {
  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-base-200 border-b border-base-300 shrink-0">
      <button
        onClick={() => setActiveTab("testcases")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          activeTab === "testcases"
            ? "bg-base-100 text-base-content shadow-sm"
            : "text-base-content/50 hover:text-base-content"
        }`}
      >
        <ListChecks className="w-3.5 h-3.5" />
        Test Cases
      </button>
      <button
        onClick={() => setActiveTab("results")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          activeTab === "results"
            ? "bg-base-100 text-base-content shadow-sm"
            : "text-base-content/50 hover:text-base-content"
        }`}
      >
        <FlaskConical className="w-3.5 h-3.5" />
        Test Results
        {testCount && testCount.total > 0 && (
          <span
            className={`badge badge-xs ml-0.5 ${
              testCount.passed === testCount.total
                ? "badge-success"
                : "badge-error"
            }`}
          >
            {testCount.passed}/{testCount.total}
          </span>
        )}
      </button>
    </div>
  );
}