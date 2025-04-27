/**
 * Utility functions for code sandboxing and execution
 * 
 * This module provides functions for safely executing code snippets
 * in a sandbox environment within the browser.
 */

/**
 * Execute JavaScript code in a sandbox environment
 * 
 * @param {string} code - The JavaScript code to execute
 * @returns {Object} An object containing the result or error
 */
export const executeJavaScript = (code) => {
  try {
    // Create a sandbox environment
    const sandbox = (code) => {
      // Capture console.log output
      const originalConsoleLog = console.log;
      const logOutput = [];
      
      // Override console.log to capture output
      console.log = (...args) => {
        logOutput.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      };
      
      try {
        // Execute the code in this scope
        const asyncEval = async (code) => {
          // Create a safe function wrapper
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          
          // Remove potentially harmful operations
          if (containsRestrictedOperations(code)) {
            throw new Error("Security error: Attempt to use restricted operations.");
          }
          
          // Execute with limited execution time
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Execution timed out after 3 seconds")), 3000);
          });
          
          const execPromise = new Promise(async (resolve) => {
            try {
              // Create a new function to execute the code with some predefined safe globals
              const safeGlobals = {
                Math, String, Array, Object, Number, RegExp, Date, JSON,
                Boolean, Promise, Set, Map, WeakMap, WeakSet,
                isFinite, isNaN, parseFloat, parseInt,
                console: { log: console.log }
              };
              
              // Convert globals to parameters and values
              const keys = Object.keys(safeGlobals);
              const values = keys.map(key => safeGlobals[key]);
              
              // Create the function with safe globals as parameters
              const func = new AsyncFunction(...keys, `
                "use strict";
                ${code}
              `);
              
              // Execute the function with the safe globals
              await func(...values);
              resolve();
            } catch (err) {
              resolve(err);
            }
          });
          
          // Race between execution and timeout
          return Promise.race([execPromise, timeoutPromise]);
        };
        
        asyncEval(code).catch(err => {
          logOutput.push(`Error: ${err.message}`);
        });
        
        // Restore console.log
        console.log = originalConsoleLog;
        
        return { result: logOutput.join('\n'), error: null };
      } catch (err) {
        // Restore console.log
        console.log = originalConsoleLog;
        return { result: null, error: err.toString() };
      }
    };
    
    // Execute in the sandbox
    return sandbox(code);
  } catch (err) {
    return { result: null, error: err.toString() };
  }
};

/**
 * Checks for restricted operations in code
 * 
 * @param {string} code - The code to check
 * @returns {boolean} - True if restricted operations are found
 */
const containsRestrictedOperations = (code) => {
  const restrictedPatterns = [
    /(\W|^)(document|window|localStorage|sessionStorage|navigator)(\W|$)/,
    /(\W|^)(location|history|fetch|XMLHttpRequest)(\W|$)/,
    /(\W|^)(eval|Function|setTimeout|setInterval)(\W|$)/,
    /(\W|^)(parent|top|frames|opener)(\W|$)/,
    /(\W|^)(indexedDB|webkitIndexedDB|mozIndexedDB|msIndexedDB)(\W|$)/,
    /(\W|^)(require|module|exports|__dirname|__filename|process)(\W|$)/,
    /(\W|^)(alert|confirm|prompt)(\W|$)/
  ];
  
  return restrictedPatterns.some(pattern => pattern.test(code));
};

/**
 * Simulate Python execution by parsing and interpreting print statements
 * 
 * @param {string} code - The Python code to simulate
 * @returns {Object} An object containing the result or error
 */
export const simulatePython = (code) => {
  try {
    let output = "Python execution simulation:\n\n";
    
    // Basic simulation of python print statements
    const printMatches = code.match(/print\s*\((.*?)\)/g) || [];
    const printOutputs = printMatches.map(match => {
      const contentMatch = match.match(/print\s*\((.*?)\)/);
      if (contentMatch && contentMatch[1]) {
        let content = contentMatch[1].trim();
        // Handle string literals
        if ((content.startsWith('"') && content.endsWith('"')) || 
            (content.startsWith("'") && content.endsWith("'"))) {
          return content.slice(1, -1);
        }
        // Handle simple variables (just a simulation)
        if (!/["'{}()\[\]]/.test(content)) {
          return content;
        }
        return content;
      }
      return "";
    });
    
    if (printOutputs.length > 0) {
      output += printOutputs.join("\n");
    } else {
      output += "No print statements found.";
    }
    
    return { result: output, error: null };
  } catch (err) {
    return { result: null, error: err.toString() };
  }
};

export default {
  executeJavaScript,
  simulatePython
}; 