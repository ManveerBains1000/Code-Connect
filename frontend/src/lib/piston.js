const PISTON_API = "https://emkc.org/api/v2/piston";

const LANGUAGES = {
  javascript: {
    language: "javascript",
    version: "18.5.0",
  },
  python: {
    language: "python",
    version: "3.10.0",
  },
  java: {
    language: "java",
    version: "17.0.0",
  },
  cpp: {
    language: "cpp",
    version: "20.0.0",
  },
};
/**
 *
 * @param {string} language - programming language to execute the code in (e.g., 'javascript', 'python', 'java', 'cpp')
 * @param {string} code - the source code to execute
 * @returns {Promise<{success: boolean, output: string, error?: string}>} - the output, error message (if any), and exit code of the executed codek
 */

export async function executeCode(language, code) {
  try {
    const langConfig = LANGUAGES[language.toLowerCase()];
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }
    const response = await fetch(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {    "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            main: `main.${getFileExtension(language)}`,
            content: code,
          },
        ],
      }),
    }); 
    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }
    const data = await response.json();
    const output = data.run.output || "";
    const stderr = data.run.stderr || "";
    if (stderr) {
        return {
            success: false,
            output:output,
            error: stderr,
        }
    }
    return {
      success: true,
      output: output,
    };
  } catch (error) {
    return {
      success: false,
      output: "",
      error: `Unsupported language: ${language}`,
    };
  }
}

function getFileExtension(language) {
    const extensions = {
        javascript: "js",
        python: "py",
        java: "java",
        cpp: "cpp",
    };
    return extensions[language.toLowerCase()] || "txt";
}