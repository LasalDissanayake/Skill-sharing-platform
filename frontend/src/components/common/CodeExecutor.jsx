import React, { useState } from 'react';
import { executeJavaScript, simulatePython } from '../../utils/codeSandbox';

const CodeExecutor = ({ code, language }) => {
  const [output, setOutput] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);

  const executeCode = () => {
    setIsExecuting(true);
    setOutput(null);
    setError(null);
    
    setTimeout(() => {
      try {
        let result;
        
        switch (language) {
          case 'javascript':
            result = executeJavaScript(code);
            break;
          case 'python':
            result = simulatePython(code);
            break;
          default:
            setOutput(`Execution for ${language} is not supported in the browser.`);
            return;
        }
        
        if (result.error) {
          setError(result.error);
        } else {
          setOutput(result.result || 'No output');
        }
      } catch (err) {
        setError(err.toString());
      } finally {
        setIsExecuting(false);
      }
    }, 500); // Small delay to show the loading state
  };

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${language === 'javascript' ? 'bg-yellow-400' : language === 'python' ? 'bg-blue-600' : 'bg-gray-500'}`}></span>
          <span className="font-medium">{language.charAt(0).toUpperCase() + language.slice(1)}</span>
        </div>
        <button
          onClick={executeCode}
          disabled={isExecuting}
          className={`px-3 py-1 rounded-md text-sm ${
            isExecuting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isExecuting ? (
            <>
              <i className='bx bx-loader-alt animate-spin mr-1'></i>
              Running...
            </>
          ) : (
            <>
              <i className='bx bx-play mr-1'></i>
              Run Now
            </>
          )}
        </button>
      </div>
      
      <div className="p-4 bg-gray-900 text-white font-mono text-sm overflow-x-auto">
        <pre>{code}</pre>
      </div>
      
      {(output || error) && (
        <div className="border-t border-gray-200">
          <div className="bg-gray-100 px-3 py-2">
            <span className="font-medium">Output</span>
          </div>
          <div className={`p-4 font-mono text-sm overflow-x-auto ${error ? 'bg-red-50 text-red-600' : 'bg-gray-50'}`}>
            <pre>{error || output}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExecutor; 