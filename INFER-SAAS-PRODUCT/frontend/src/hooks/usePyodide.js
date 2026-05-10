import { useState, useRef, useCallback } from 'react';
import { pyodideScript } from '@/utils/clientAnalysis';

export function usePyodide() {
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideLoading, setPyodideLoading] = useState(false);
  const [pyodideError, setPyodideError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(null); 
  const workerRef = useRef(null);
  const resolvesRef = useRef({});
  const msgIdRef = useRef(0);

  const initPyodide = useCallback(async () => {
    if (workerRef.current || pyodideReady) return;
    if (pyodideLoading) return;

    setPyodideLoading(true);
    setLoadingStep("Loading privacy engine...");

    try {
      if (typeof window.Worker !== "undefined") {
        const workerCode = `
          importScripts("https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js");

          let pyodide = null;

          self.onmessage = async (event) => {
            const { id, type, payload } = event.data;
            try {
              if (type === "INIT") {
                self.postMessage({ type: "STATUS", payload: "Loading privacy engine..." });
                pyodide = await loadPyodide();
                self.postMessage({ type: "STATUS", payload: "Installing packages..." });
                await pyodide.loadPackage("micropip");
                const micropip = pyodide.pyimport("micropip");
                await micropip.install(['pandas', 'scipy', 'numpy', 'statsmodels']);
                pyodide.runPython(payload.script);
                self.postMessage({ type: "STATUS", payload: "Ready" });
                self.postMessage({ id, type: "INIT_SUCCESS" });
              } else if (type === "RUN") {
                const process_csv = pyodide.globals.get('process_csv');
                const result = process_csv(payload.csv);
                self.postMessage({ id, type: "RUN_SUCCESS", payload: result });
              }
            } catch (err) {
              self.postMessage({ id, type: "ERROR", payload: err.message });
            }
          };
        `;

        const blob = new Blob([workerCode], { type: "application/javascript" });
        const worker = new Worker(URL.createObjectURL(blob));

        worker.onmessage = (event) => {
          const { id, type, payload } = event.data;
          
          if (type === "STATUS") {
            setLoadingStep(payload);
            if (payload === "Ready") {
              setPyodideReady(true);
              setPyodideLoading(false);
            }
          } else if (type === "INIT_SUCCESS") {
            if (resolvesRef.current[id]) resolvesRef.current[id].resolve();
          } else if (type === "RUN_SUCCESS") {
            if (resolvesRef.current[id]) resolvesRef.current[id].resolve(payload);
          } else if (type === "ERROR") {
            if (resolvesRef.current[id]) resolvesRef.current[id].reject(new Error(payload));
            else {
              setPyodideError(payload);
              setPyodideLoading(false);
            }
          }
        };

        workerRef.current = worker;

        const id = msgIdRef.current++;
        worker.postMessage({ id, type: "INIT", payload: { script: pyodideScript } });

        await new Promise((resolve, reject) => {
          resolvesRef.current[id] = { resolve, reject };
        });
        delete resolvesRef.current[id];
      } else {
        // Fallback to main thread
        console.warn("Web Worker not supported, falling back to main thread.");
        if (!window.loadPyodide) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        const pyodide = await window.loadPyodide();
        setLoadingStep("Installing packages...");
        await pyodide.loadPackage("micropip");
        const micropip = pyodide.pyimport("micropip");
        await micropip.install(['pandas', 'scipy', 'numpy', 'statsmodels']);
        pyodide.runPython(pyodideScript);
        workerRef.current = {
            pyodide,
            isMainThread: true
        };
        setLoadingStep("Ready");
        setPyodideReady(true);
        setPyodideLoading(false);
      }
    } catch (err) {
      console.error(err);
      setPyodideError(err.message || "Failed to load Pyodide");
      setPyodideLoading(false);
    }
  }, [pyodideLoading, pyodideReady]);

  const runAnalysis = useCallback(async (csvString) => {
    if (!workerRef.current) {
      await initPyodide();
    }
    
    if (workerRef.current.isMainThread) {
        const process_csv = workerRef.current.pyodide.globals.get('process_csv');
        const resultJsonStr = process_csv(csvString);
        return JSON.parse(resultJsonStr);
    }

    const id = msgIdRef.current++;
    workerRef.current.postMessage({ id, type: "RUN", payload: { csv: csvString } });

    const resultJsonStr = await new Promise((resolve, reject) => {
      resolvesRef.current[id] = { resolve, reject };
    });
    delete resolvesRef.current[id];

    return JSON.parse(resultJsonStr);
  }, [initPyodide]);

  return { pyodideReady, pyodideLoading, pyodideError, loadingStep, initPyodide, runAnalysis };
}
