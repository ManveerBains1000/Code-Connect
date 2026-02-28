import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { PROBLEMS } from '../data/Problems';
import Navbar from '../components/NavBar';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ProblemDescription from '../components/ProblemDescription';
import { Code } from 'lucide-react';
import CodeEditor from '../components/Codeeditor';
import OutputPanel from '../components/OutputPanel';
const ProblemPage = () => {
    const {id} = useParams()
    const navigate = useNavigate();
    const [currentProblemId, setCurrentProblemId] = React.useState("two-sum");
    const [selectedLanguage, setSelectedLanguage] = React.useState("javascript");
    const [code,setCode] = React.useState(PROBLEMS[currentProblemId].starterCode.javascript);
    const [isRunning, setIsRunning] = React.useState(false);
    const [output, setOutput] = React.useState("");

    const currentProblem = PROBLEMS[currentProblemId];
    const handleLanguageChange = (e) => {}
    const handleProblemChange = (newProblemId) => {}
    const triggerConfetti = () => {}
    const checkIfTestsPassed = (output) => {}
    const handleRunCode = async () => {}
    useEffect(() => {
        if (id && PROBLEMS[id]) {
            setCurrentProblemId(id);
            setCode(PROBLEMS[id].starterCode[selectedLanguage]);
            setOutput(null);
        }
    },[id,selectedLanguage])
  return (
    <div className='h-screen w-screen bg-base-100 flex flex-col'>
        <Navbar/>
        <div className='flex-1 overflow-hidden'>
            <PanelGroup direction="horizontal" className='h-full'>
                {/* problem description panel  */}
                <Panel defaultSize={40} minSize={30}>
                    <ProblemDescription
                    problem = {currentProblem}
                    currentProblemId = {currentProblemId}
                    onProblemChange={handleProblemChange}
                    allProblems={Object.values(PROBLEMS)}                    
                    />

                </Panel>
                <PanelResizeHandle className='w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize'/>
                {/* code editor panel and output panel  */}
                <Panel defaultSize={60} minSize={30}>
                    <PanelGroup direction="vertical" className='h-full'>
                        <Panel defaultSize={70} minSize={30}>
                            <CodeEditor/>
                        </Panel>
                                        <PanelResizeHandle className='h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize'/>
                        <Panel defaultSize={30} minSize={20}>
                            <OutputPanel/>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
        Problem Page
    </div>
  )
}

export default ProblemPage
