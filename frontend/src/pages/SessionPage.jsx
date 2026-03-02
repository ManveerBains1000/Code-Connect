import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems.js";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { useSessionsById, useJoinSession, useEndSession } from "../hooks/useSessions";
import { useAuth } from "../context/AuthContext";
import { LogOutIcon, UserPlusIcon } from "lucide-react";

const SessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: sessionData, isLoading } = useSessionsById(id);
  const session = sessionData?.session;

  const joinMutation = useJoinSession(id);
  const endMutation = useEndSession(id);

  const problem = session ? PROBLEMS[session.problem] : null;
  const fallbackProblem = Object.values(PROBLEMS)[0];
  const currentProblem = problem || fallbackProblem;
  const currentProblemId = session?.problem || Object.keys(PROBLEMS)[0];

  const [selectedLanguage, setSelectedLanguage] = React.useState("javascript");
  const [code, setCode] = React.useState("");
  const [isRunning, setIsRunning] = React.useState(false);
  const [output, setOutput] = React.useState(null);

  useEffect(() => {
    if (currentProblem) {
      setCode(currentProblem.starterCode[selectedLanguage] || "");
    }
  }, [currentProblemId, selectedLanguage]);

  // Redirect if session is completed
  useEffect(() => {
    if (session?.status === "completed") {
      toast("Session has ended");
      navigate("/dashboard");
    }
  }, [session?.status]);

  const isHost = session?.host?._id === user?._id || session?.host === user?._id;
  const isParticipant =
    session?.participant?._id === user?._id || session?.participant === user?._id;
  const isMember = isHost || isParticipant;
  const hasParticipant = !!session?.participant;

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang] || "");
    setOutput(null);
  };

  const normalizeLine = (line) =>
    line.trim().replace(/\[\s+/g, "[").replace(/\s+\]/g, "]").replace(/\s*,\s*/g, ",");

  const normalizeOutput = (out) =>
    out.trim().split("\n").map(normalizeLine).filter((l) => l.length > 0).join("\n");

  const buildTestResults = (rawOutput, language) => {
    const examples = currentProblem.examples || [];
    const expectedBlock = currentProblem.expectedOutput?.[language] || "";
    const expectedLines = expectedBlock.split("\n").map(normalizeLine).filter((l) => l.length > 0);
    const actualLines = (rawOutput || "").split("\n").map(normalizeLine).filter((l) => l.length > 0);
    return expectedLines.map((expected, i) => ({
      input: examples[i]?.input || `Case ${i + 1}`,
      label: examples[i]?.input || "",
      expected,
      actual: actualLines[i] ?? "",
      passed: (actualLines[i] ?? "") === expected,
    }));
  };

  const determineVerdict = (result, testResults) => {
    if (!result.success) {
      const err = (result.error || "").toLowerCase();
      if (err.includes("compile") || err.includes("syntax") || err.includes("error:") || err.includes("unexpected"))
        return "Compilation Error";
      return "Runtime Error";
    }
    return testResults.every((t) => t.passed) ? "Accepted" : "Wrong Answer";
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    const testResults = result.success ? buildTestResults(result.output, selectedLanguage) : [];
    const verdict = determineVerdict(result, testResults);
    const enriched = { ...result, verdict, testResults, language: selectedLanguage };
    setOutput(enriched);
    setIsRunning(false);
    if (verdict === "Accepted") {
      confetti({ particleCount: 80, spread: 250, origin: { x: 0.2, y: 0.6 } });
      confetti({ particleCount: 80, spread: 250, origin: { x: 0.8, y: 0.6 } });
      toast.success("All tests passed!");
    } else if (verdict === "Wrong Answer") {
      toast.error("Wrong answer — check your output!");
    } else {
      toast.error(verdict);
    }
  };

  const handleReset = () => {
    setCode(currentProblem.starterCode[selectedLanguage] || "");
    setOutput(null);
  };

  const handleJoin = () => joinMutation.mutate();
  const handleEnd = () =>
    endMutation.mutate(undefined, { onSuccess: () => navigate("/dashboard") });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <p className="text-xl font-bold mb-4">Session not found</p>
          <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-base-100 flex flex-col">
      <Navbar />

      {/* Session bar */}
      <div className="bg-base-200 border-b border-base-300 px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-base-content/80">
            {session.problem} &nbsp;·&nbsp;
            <span className={`badge badge-sm ${session.difficulty === "easy" ? "badge-success" : session.difficulty === "medium" ? "badge-warning" : "badge-error"}`}>
              {session.difficulty}
            </span>
          </span>
          <span className="text-base-content/50">
            Host: <span className="text-base-content">{session.host?.name || "—"}</span>
          </span>
          {session.participant && (
            <span className="text-base-content/50">
              Participant: <span className="text-base-content">{session.participant?.name || "—"}</span>
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {!isMember && !hasParticipant && (
            <button
              className="btn btn-sm btn-primary gap-1"
              onClick={handleJoin}
              disabled={joinMutation.isPending}
            >
              {joinMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : <UserPlusIcon className="size-4" />}
              Join Session
            </button>
          )}
          {isHost && (
            <button
              className="btn btn-sm btn-error gap-1"
              onClick={handleEnd}
              disabled={endMutation.isPending}
            >
              {endMutation.isPending ? <span className="loading loading-spinner loading-xs" /> : <LogOutIcon className="size-4" />}
              End Session
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          <Panel defaultSize={40} minSize={25}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={() => {}}
              allProblems={Object.values(PROBLEMS)}
            />
          </Panel>
          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical" className="h-full">
              <Panel defaultSize={70} minSize={30}>
                <CodeEditor
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                  selectedLanguage={selectedLanguage}
                />
              </Panel>
              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />
              <Panel defaultSize={30} minSize={20}>
                <OutputPanel
                  output={output}
                  isRunning={isRunning}
                  selectedLanguage={selectedLanguage}
                  problem={currentProblem}
                  onRerun={handleRunCode}
                  onReset={handleReset}
                />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default SessionPage;
