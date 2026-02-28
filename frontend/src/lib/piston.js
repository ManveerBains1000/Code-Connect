const JUDGE0_API = "https://ce.judge0.com";

// Judge0 CE language IDs
const LANGUAGES = {
  javascript: { id: 63 },
  python:     { id: 71 },
  java:       { id: 62 },
  cpp:        { id: 54 },
};

/**
 * @param {string} language - programming language ('javascript', 'python', 'java', 'cpp')
 * @param {string} code - the source code to execute
 * @returns {Promise<{success: boolean, output: string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const langConfig = LANGUAGES[language.toLowerCase()];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const response = await fetch(
      `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: langConfig.id,
          stdin: "",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.statusText}`);
    }

    const data = await response.json();

    const stdout = data.stdout || "";
    const stderr = data.stderr || "";
    const compileOutput = data.compile_output || "";
    const statusId = data.status?.id;

    // status 3 = Accepted, anything else is an error
    if (statusId !== 3) {
      const errorMsg = compileOutput || stderr || data.status?.description || "Runtime error";
      return { success: false, output: stdout, error: errorMsg };
    }

    return { success: true, output: stdout };
  } catch (error) {
    return { success: false, output: "", error: error.message };
  }
}