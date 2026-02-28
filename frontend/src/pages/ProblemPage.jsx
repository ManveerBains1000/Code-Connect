import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { PROBLEMS } from "../data/problems.js";
import Navbar from "../components/NavBar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from "../components/ProblemDescription";
import { Code } from "lucide-react";
import CodeEditor from "../components/Codeeditor";
import OutputPanel from "../components/OutputPanel";
import { executeCode } from "../lib/Piston.js";
import toast from "react-hot-toast";
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
  const normalizeOutput = (output) => {
    return output
      .trim()
      .split("\n")
      .map((line) =>
        line
          .trim()
          .replace(/\[\s+/g, "[")
          .replace(/\s+\]/g, "]")
          .replace(/\s*,\s*/g, ","),
      )
      .filter((line) => line.length > 0)
      .join("\n");
  };
  const triggerConfetti = () => {
        confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.2, y: 0.6 },
    });

    confetti({
      particleCount: 80,
      spread: 250,
      origin: { x: 0.8, y: 0.6 },
    });
  };
  const checkIfTestsPassed = (actualOutput, expectedOutput) => {
        const normalizedActual = normalizeOutput(actualOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);
    return normalizedActual == normalizedExpected;
  }
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    if (result.success) {
      const expectedOutput = currentProblem.expectedOutput[selectedLanguage];
      const testsPassad = checkIfTestsPassed(result.output, expectedOutput);
      if (testsPassad) {
        toast.success("All tests passed! Great job!");
      } else {
        toast.error("Tests failed. check your output!");
      }
    } else {
      toast.error("Code excution failed!");
    }
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
                <OutputPanel />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default ProblemPage;
