import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'rust', label: 'Rust' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'scala', label: 'Scala' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'yaml', label: 'YAML' },
];

const CodePostEditor = ({
  code = '',
  codeLanguage = 'javascript',
  codeTitle = '',
  onCodeChange,
  onLanguageChange,
  onTitleChange,
  previewMode = false
}) => {
  const [showPreview, setShowPreview] = useState(previewMode);
  const [internalCode, setInternalCode] = useState(code);
  const [internalLanguage, setInternalLanguage] = useState(codeLanguage);
  const [internalTitle, setInternalTitle] = useState(codeTitle);

  useEffect(() => {
    setInternalCode(code);
    setInternalLanguage(codeLanguage);
    setInternalTitle(codeTitle);
  }, [code, codeLanguage, codeTitle]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setInternalCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setInternalLanguage(newLanguage);
    onLanguageChange?.(newLanguage);
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setInternalTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
      <div className="bg-gray-100 p-3 border-b border-gray-300">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-grow">
            <input
              type="text"
              value={internalTitle}
              onChange={handleTitleChange}
              placeholder="Title for your code snippet"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor"
              disabled={previewMode}
            />
          </div>
          <div>
            <select
              value={internalLanguage}
              onChange={handleLanguageChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-DarkColor focus:border-DarkColor bg-white"
              disabled={previewMode}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>
          {!previewMode && (
            <div>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-DarkColor"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 text-white">
        {showPreview ? (
          <SyntaxHighlighter 
            language={internalLanguage} 
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLines={true}
            className="rounded-b-lg"
          >
            {internalCode || '// Type your code here'}
          </SyntaxHighlighter>
        ) : (
          <textarea
            value={internalCode}
            onChange={handleCodeChange}
            placeholder="// Enter your code here"
            className="w-full p-4 bg-gray-800 text-white font-mono text-sm focus:outline-none"
            rows="10"
            disabled={previewMode}
          ></textarea>
        )}
      </div>
    </div>
  );
};

export default CodePostEditor; 