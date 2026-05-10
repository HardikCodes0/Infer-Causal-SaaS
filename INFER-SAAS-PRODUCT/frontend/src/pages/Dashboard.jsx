import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useReactToPrint } from "react-to-print";
import {
  CloudUpload,
  History as HistoryIcon,
  BarChart3,
  Clock,
  Download
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Wizard from "@/components/upload/Wizard";
import ATECard from "@/components/cards/ATECard";
import CUPEDCard from "@/components/cards/CUPEDCard";
import SummaryCard from "@/components/cards/SummaryCard";
import StatCard from "@/components/cards/StatCard";
import SegmentChart from "@/components/charts/SegmentChart";
import { AlertBanner } from "@/components/ui/AlertBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResultsSkeleton } from "@/components/ui/SkeletonLoader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"; // We will simulate the switch with a styled checkbox if it doesn't exist
import { Shield, Lock } from "lucide-react";
import { usePyodide } from "@/hooks/usePyodide";
import ModeComparisonCard from "@/components/ModeComparisonCard";
import InterpreterPanel from "@/components/InterpreterPanel";

const API_URL = "http://localhost:8000";

export default function Dashboard() {
  const [view, setView] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [experimentMeta, setExperimentMeta] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [privacyMode, setPrivacyMode] = useState(false);
  const [analyzedPrivately, setAnalyzedPrivately] = useState(false);

  const { pyodideReady, pyodideLoading, pyodideError, loadingStep, initPyodide, runAnalysis } = usePyodide();

  const filteredHistory = historyItems.filter(h => 
    (h.name || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
    (h.id || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setHistoryItems(res.data.history);
      }
    } catch (e) {
      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/auth";
      }
      console.error("Failed to load history", e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAnalyse = async (file, meta) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setExperimentMeta(meta);
    setView("results");
    
    try {
      if (privacyMode) {
        setAnalyzedPrivately(true);
        if (!pyodideReady) {
          await initPyodide();
        }
        
        const reader = new FileReader();
        const csvString = await new Promise((resolve, reject) => {
           reader.onload = (e) => resolve(e.target.result);
           reader.onerror = (e) => reject(new Error("File read error"));
           reader.readAsText(file);
        });
        
        const res = await runAnalysis(csvString);
        setResults(res);
      } else {
        setAnalyzedPrivately(false);
        const formData = new FormData();
        formData.append("file", file);
        if (meta && meta.name) {
          formData.append("name", meta.name);
        }
        
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_URL}/analyze`, formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          }
        });
        setResults(response.data.results);
        fetchHistory(); // Refresh history with the new test
      }
    } catch (e) {
      const msg = e.response?.data?.detail?.errors?.join(", ") 
                  || e.response?.data?.detail 
                  || e.message
                  || "Analysis failed. Check your CSV format.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeView={view} onSelect={setView} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar 
          latestRun={historyItems[0]} 
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          setView={setView}
        />

        <main
          className="flex-1 overflow-y-auto px-6 py-10 sm:px-10"
          data-testid="main-content"
        >
          <div className="mx-auto max-w-6xl">
            {view === "upload" && (
              <div className="pt-4">
                <div className="mx-auto max-w-3xl mb-6">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${privacyMode ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {privacyMode ? <Lock className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {privacyMode ? "Privacy mode — data stays in your browser" : "Standard mode"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {privacyMode 
                            ? "No data leaves your device. Analysis runs locally." 
                            : "Data is securely sent to our servers for fast processing."}
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={privacyMode} 
                        onChange={(e) => {
                          setPrivacyMode(e.target.checked);
                          if (e.target.checked && !pyodideReady && !pyodideLoading) {
                            initPyodide();
                          }
                        }} 
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300"></div>
                    </label>
                  </div>
                  
                  {privacyMode && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                      <ModeComparisonCard />
                    </div>
                  )}
                  
                  {pyodideLoading && privacyMode && (
                    <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
                        <p className="text-sm font-medium text-emerald-800">
                          {loadingStep || "Loading privacy engine — this takes ~15 seconds the first time"}
                        </p>
                      </div>
                    </div>
                  )}

                  {pyodideError && privacyMode && (
                    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                      <p className="text-sm font-medium text-rose-800">
                        Error loading privacy engine: {pyodideError}
                      </p>
                    </div>
                  )}
                </div>
                <Wizard onComplete={handleAnalyse} loading={loading} />
              </div>
            )}
            {view === "results" && (
              <ResultsView
                loading={loading}
                loadingStep={loadingStep}
                results={results}
                error={error}
                meta={experimentMeta}
                analyzedPrivately={analyzedPrivately}
                onUploadClick={() => setView("upload")}
              />
            )}
            {view === "history" && (
              <HistoryView 
                items={filteredHistory} 
                onRevisit={(item) => {
                  setResults(item.results);
                  setExperimentMeta({
                    name: item.name,
                    team: "Historical Data",
                    hypothesis: "Revisiting past experiment results.",
                    metric: "Primary",
                    direction: "Increase"
                  });
                  setView("results");
                }}
              />
            )}
            {view === "settings" && <SettingsView />}
            {view === "help" && <HelpView />}
          </div>
        </main>
      </div>
    </div>
  );
}

const HealthRing = ({ score }) => {
  if (score === null) return null;
  const color = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm min-w-[280px]">
      <div className="relative h-14 w-14 flex-shrink-0">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={radius} className="stroke-slate-100" strokeWidth="4" fill="none" />
          <circle 
            cx="24" cy="24" r={radius} 
            className={`transition-all duration-1000 ease-out stroke-current ${color}`} 
            strokeWidth="4" 
            fill="none" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-slate-900">
          {score}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">Experiment Health</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {score >= 80 ? "Highly trustworthy" : score >= 50 ? "Review with caution" : "Unreliable results"}
        </p>
      </div>
    </div>
  );
};

const ResultsView = ({ loading, loadingStep, results, error, meta, analyzedPrivately, onUploadClick }) => {
  const componentRef = useRef(null);

  const exportPDF = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Experiment_Report_${meta?.name || 'Results'}`,
    pageStyle: `
      @page { size: auto; margin: 20mm; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    `
  });

  const calculateHealthScore = () => {
    if (!results) return null;
    let score = 100;
    if (results.srm?.srm_detected) score -= 40;
    if (results.power && !results.power.adequately_powered) score -= 20;
    if (results.ate?.p_value > 0.05 && results.ate?.p_value <= 0.10) score -= 10;
    
    if (results.cuped?.cuped_applied) score = Math.min(100, score + 10);
    if (results.sequential?.peeking_risk === 'low') score = Math.min(100, score + 10);
    return score;
  };

  const healthScore = calculateHealthScore();

  let bestSegment = { name: "N/A", lift: 0 };
  let hasSegments = false;
  
  if (results && results.cate) {
    const entries = Object.entries(results.cate);
    if (entries.length > 0) {
      hasSegments = true;
      const best = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max, entries[0]);
      bestSegment = { name: best[0], lift: best[1] };
    }
  }

  return (
  <div data-testid="results-view" id="results-view" className="bg-slate-50 p-6 rounded-2xl">
    <div className="flex items-end justify-between gap-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
          <BarChart3 className="h-3.5 w-3.5" />
          {meta?.team ? `${meta.team} Team Report` : "Inference report"}
          {analyzedPrivately && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 normal-case tracking-normal">
              <Lock className="h-3 w-3" /> Analyzed privately — no data was sent to any server
            </span>
          )}
        </div>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-950">
          {meta?.name || "Experiment Results"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Generated{" "}
          <span className="text-slate-700">
            {results || loading ? "just now" : "—"}
          </span>{" "}
          · sample {results || loading ? "n = 84,512" : "—"}
        </p>
      </div>
      <div id="report-actions" className="flex gap-3 transition-opacity duration-300">
        <Button variant="outline" onClick={exportPDF} size="sm" disabled={loading || !results}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="secondary" onClick={onUploadClick} size="sm">
          New analysis
        </Button>
      </div>
    </div>

    {meta?.hypothesis && (
      <div className="mt-6 flex gap-6">
        <div className="flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tested Hypothesis</h4>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-900">
            "{meta.hypothesis}"
          </p>
          <div className="mt-3 flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Metric:</span>
              <span className="font-medium text-slate-700">{meta.metric || "Primary"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Target:</span>
              <span className={`font-medium ${meta.direction === 'increase' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {meta.direction || "increase"}
              </span>
            </div>
          </div>
        </div>
        {results && <HealthRing score={healthScore} />}
      </div>
    )}
    {!meta?.hypothesis && results && (
      <div className="mt-6">
        <HealthRing score={healthScore} />
      </div>
    )}

    {error && (
      <div
        className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        data-testid="error-message"
      >
        {error}
      </div>
    )}

    {loading && (
      <div className="mt-8 text-center py-10">
        {analyzedPrivately ? (
          <div className="space-y-4">
             <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
             <p className="text-emerald-700 font-medium">{loadingStep || "Running private analysis in browser..."}</p>
          </div>
        ) : (
          <ResultsSkeleton />
        )}
      </div>
    )}

    {!loading && !results && !error && (
      <div className="mt-10">
        <EmptyState
          title="No results yet"
          description="Upload a CSV from the upload tab to see your inference report here."
          action={
            <Button onClick={onUploadClick}>Upload an experiment</Button>
          }
        />
      </div>
    )}

    {results && !loading && (
      <div className="mt-8 space-y-6" data-testid="results-section">
        {results.srm?.srm_detected && (
          <AlertBanner
            data-testid="srm-alert"
            title="Sample Ratio Mismatch detected — experiment assignment may be broken."
            description="Variant proportions are not random. Results below are unreliable until the assignment pipeline is verified."
            meta={
              <span data-testid="srm-p-value">
                SRM p-value = {results.srm.p_value.toExponential(2)}
              </span>
            }
          />
        )}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Lift"
            value={`${results.ate.ate >= 0 ? "+" : ""}${(results.ate.ate * 100).toFixed(1)}%`}
            tone={results.ate.ate >= 0 ? "emerald" : "rose"}
            hint="point estimate"
            tooltip="Average Treatment Effect: The expected difference in the primary metric if everyone received the treatment."
          />
          <StatCard
            label="p-value"
            value={results.ate.p_value.toFixed(3)}
            hint={results.ate.p_value < 0.05 ? "significant" : "not significant"}
            tooltip="The probability of seeing this effect by chance if the treatment actually did nothing."
          />
          <StatCard
            label="CUPED gain"
            value={results.cuped?.variance_reduction_pct ? `${results.cuped.variance_reduction_pct.toFixed(1)}%` : "0%"}
            hint="variance reduction"
            tooltip="Uses pre-experiment data to reduce noise. Higher gain means faster and more accurate results."
          />
          <StatCard
            label="Best Segment"
            value={hasSegments ? `+${(bestSegment.lift * 100).toFixed(1)}%` : "N/A"}
            hint={hasSegments ? bestSegment.name : "no segments detected"}
            tooltip="Conditional Average Treatment Effect: Identifies if a specific segment responded significantly better."
          />
        </div>

        <div
          className={
            results.srm?.srm_detected
              ? "space-y-6 opacity-60 transition"
              : "space-y-6 transition"
          }
          data-testid="results-grid"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ATECard ate={results.ate} />
            <CUPEDCard cuped={results.cuped} />
          </div>
          <SegmentChart cate={results.cate} />
          <SummaryCard summary={results.summary} />
          <InterpreterPanel results={results} experimentMeta={meta} />
        </div>
      </div>
    )}

    {/* HIDDEN PDF TEMPLATE */}
    {results && (
      <div className="hidden print:block">
        <div ref={componentRef} className="bg-white text-slate-900 w-full" style={{ padding: '40px' }}>
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Official Report</p>
              <h1 className="mt-2 text-4xl font-black text-slate-900 tracking-tight">{meta?.name || "Experiment Results"}</h1>
              <p className="mt-3 text-lg text-slate-600">Team: <span className="font-medium text-slate-900">{meta?.team || "General"}</span></p>
            </div>
            <div className="text-right">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white">
                <BarChart3 className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm text-slate-500">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Hypothesis & Summary */}
          <div className="mt-10 grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-8">
              <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Executive Summary</h3>
                <p className="text-lg leading-relaxed text-slate-800 font-medium">{results.summary}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Hypothesis</h3>
                <p className="text-base text-slate-700 italic border-l-4 border-slate-300 pl-4 py-1">"{meta?.hypothesis || "N/A"}"</p>
              </div>
            </div>
            <div className="col-span-1">
              <div className="rounded-2xl border-2 border-slate-900 bg-white p-6 text-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Health Score</p>
                <p className={`mt-2 text-6xl font-black ${healthScore >= 80 ? 'text-emerald-500' : healthScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>{healthScore}</p>
                <p className="mt-2 text-sm font-medium text-slate-600">/ 100 points</p>
              </div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="mt-12">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Core Statistical Results</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500 uppercase">Est. Lift</p>
                <p className={`mt-2 text-2xl font-bold ${results.ate?.ate >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {results.ate?.ate >= 0 ? "+" : ""}{(results.ate?.ate * 100).toFixed(2)}%
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500 uppercase">p-value</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{results.ate?.p_value.toFixed(4)}</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500 uppercase">CUPED Gain</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{results.cuped?.variance_reduction_pct ? `${results.cuped.variance_reduction_pct.toFixed(1)}%` : "N/A"}</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-5">
                <p className="text-xs font-medium text-slate-500 uppercase">Power</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{results.power?.adequately_powered ? "Adequate" : "Low"}</p>
              </div>
            </div>
          </div>

          {/* Advanced Diagnostics */}
          <div className="mt-12">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Advanced Diagnostics</h3>
            <div className="flex flex-col gap-4">
              {results.bayesian && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-indigo-900">Bayesian Probability</h4>
                      <p className="mt-2 text-sm text-indigo-800 leading-relaxed">{results.bayesian.interpretation}</p>
                    </div>
                    <div className="text-right ml-6">
                      <p className="text-xs font-bold uppercase text-indigo-400">P(Beat Control)</p>
                      <p className="text-2xl font-black text-indigo-600">{(results.bayesian.prob_treatment_better * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}
              {results.sequential && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                  <h4 className="font-bold text-emerald-900">Sequential Analysis (SPRT)</h4>
                  <p className="mt-2 text-sm text-emerald-800 leading-relaxed">{results.sequential.interpretation}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 border-t border-slate-200 pt-6 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Generated by Causal Inference Engine</p>
          </div>
        </div>
      </div>
    )}

  </div>
  );
};

const HistoryView = ({ items, onRevisit }) => (
  <div data-testid="history-view" className="animate-in fade-in slide-in-from-bottom-4">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
      <HistoryIcon className="h-3.5 w-3.5" />
      Workspace
    </div>
    <h1 className="mt-2 font-display text-5xl tracking-tight text-slate-950">
      Experiment history
    </h1>
    <p className="mt-2 text-sm text-slate-500">
      Past inference runs across this workspace. Click any row to revisit the full dashboard.
    </p>

    <Card className="mt-8 overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-slate-100 text-left text-[11px] font-medium uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-6 py-3">Experiment</th>
            <th className="px-6 py-3">Lift</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Run</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              onClick={() => onRevisit(it)}
              className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600">{it.name}</p>
                <p className="font-mono text-xs text-slate-400">{it.id}</p>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`font-mono text-sm ${it.ate >= 0 ? "text-emerald-700" : "text-rose-600"}`}
                >
                  {it.ate >= 0 ? "+" : ""}
                  {(it.ate * 100).toFixed(1)}%
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    it.sig
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {it.sig ? "Significant" : "Inconclusive"}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {it.timestamp ? formatDistanceToNow(new Date(it.timestamp), { addSuffix: true }) : "Unknown"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  </div>
);

const SettingsView = () => (
  <div data-testid="settings-view" className="animate-in fade-in slide-in-from-bottom-4">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
      Workspace
    </div>
    <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-950">
      Settings
    </h1>
    <p className="mt-2 text-sm text-slate-500">
      Manage your workspace preferences, team members, and API keys.
    </p>

    <Card className="mt-8 p-8">
      <EmptyState
        title="Settings coming soon"
        description="We are currently building out the workspace management features. Check back later!"
      />
    </Card>
  </div>
);

const HelpView = () => (
  <div data-testid="help-view" className="animate-in fade-in slide-in-from-bottom-4">
    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
      Resources
    </div>
    <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-slate-950">
      Help & Documentation
    </h1>
    <p className="mt-2 text-sm text-slate-500">
      Learn how to structure your A/B test data and interpret causal inference results.
    </p>

    <Card className="mt-8 p-8">
      <EmptyState
        title="Documentation under construction"
        description="Our math engine whitepaper and API documentation are currently being finalized."
      />
    </Card>
  </div>
);
