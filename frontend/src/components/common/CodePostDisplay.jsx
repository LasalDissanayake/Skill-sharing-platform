import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodePostDisplay = ({ code, language, title }) => {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden mt-2 mb-4">
      <div className="bg-gray-100 p-3 border-b border-gray-300 flex justify-between items-center">
        <div className="font-medium text-gray-800">
          {title || 'Code Snippet'}
        </div>
        <div className="text-sm text-gray-500 px-2 py-1 bg-gray-200 rounded-md">
          {language}
        </div>
      </div>
      
      <div className="bg-gray-800">
        <SyntaxHighlighter 
          language={language || 'javascript'} 
          style={vscDarkPlus}
          showLineNumbers={true}
          wrapLines={true}
          className="rounded-b-lg"
        >
          {code || '// No code provided'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodePostDisplay; 