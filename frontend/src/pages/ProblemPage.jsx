import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems.js";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import { Code } from "lucide-react";
import CodeEditor from "../components/Codeeditor";
import OutputPanel from "../components/OutputPanel";
import { executeCode } from "../lib/Piston.js";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import Navbar from "../components/Navbar.jsx";

const ProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentProblemId, setCurrentProblemId] = React.useState("two-sum");
  const [selectedLanguage, setSelectedLanguage] = React.useState("javascript");
  const [code, setCode] = React.useState(
    PROBLEMS[currentProblemId].starterCode.javascript,
  );
  const [isRunning, setIsRunning] = React.useState(false);
  const [output, setOutput] = React.useState("");

  const currentProblem = PROBLEMS[currentProblemId];
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(currentProblem.starterCode[newLang]);
    setOutput(null);
  };

  const handleProblemChange = (newProblemId) => {
    navigate(`/problem/${newProblemId}`);
  };

  const normalizeLine = (line) =>
    line
      .trim()
      .replace(/\[\s+/g, "[")
      .replace(/\s+\]/g, "]")
      .replace(/\s*,\s*/g, ",");

  const normalizeOutput = (out) =>
    out
      .trim()
      .split("\n")
      .map(normalizeLine)
      .filter((l) => l.length > 0)
      .join("\n");

  const triggerConfetti = () => {
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.2, y: 0.6 } });
    confetti({ particleCount: 80, spread: 250, origin: { x: 0.8, y: 0.6 } });
  };

  const buildTestResults = (rawOutput, language) => {
    const examples = currentProblem.examples || [];
    const expectedBlock = currentProblem.expectedOutput?.[language] || "";
    const expectedLines = expectedBlock
      .split("\n")
      .map(normalizeLine)
      .filter((l) => l.length > 0);
    const actualLines = (rawOutput || "")
      .split("\n")
      .map(normalizeLine)
      .filter((l) => l.length > 0);

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
      if (
        err.includes("compile") ||
        err.includes("syntax") ||
        err.includes("error:") ||
        err.includes("unexpected")
      )
        return "Compilation Error";
      return "Runtime Error";
    }
    return testResults.every((t) => t.passed) ? "Accepted" : "Wrong Answer";
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    const testResults = result.success
      ? buildTestResults(result.output, selectedLanguage)
      : [];
    const verdict = determineVerdict(result, testResults);

    const enriched = {
      ...result,
      verdict,
      testResults,
      language: selectedLanguage,
    };
    setOutput(enriched);
    setIsRunning(false);

    if (verdict === "Accepted") {
      triggerConfetti();
      toast.success("All tests passed! Great job!");
    } else if (verdict === "Wrong Answer") {
      toast.error("Wrong answer — check your output!");
    } else {
      toast.error(`${verdict}`);
    }
  };

  const handleReset = () => {
    setCode(currentProblem.starterCode[selectedLanguage]);
    setOutput(null);
  };
  useEffect(() => {
    if (id && PROBLEMS[id]) {
      setCurrentProblemId(id);
      setCode(PROBLEMS[id].starterCode[selectedLanguage]);
      setOutput(null);
    }
  }, [id, selectedLanguage]);
  return (
    <div className="h-screen w-screen bg-base-100 flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* problem description panel  */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              problem={currentProblem}
              currentProblemId={currentProblemId}
              onProblemChange={handleProblemChange}
              allProblems={Object.values(PROBLEMS)}
            />
          </Panel>
          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />
          {/* code editor panel and output panel  */}
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

export default ProblemPage;
