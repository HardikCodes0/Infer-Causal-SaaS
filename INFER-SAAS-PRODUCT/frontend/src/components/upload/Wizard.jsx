import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, UploadCloud, Settings, FileText, Lightbulb } from "lucide-react";
import FileUpload from "@/components/upload/FileUpload";

export default function Wizard({ onComplete, loading }) {
  const [step, setStep] = useState(1);
  const [meta, setMeta] = useState({
    name: "",
    team: "",
    startDate: "",
    endDate: "",
    hypothesis: "",
    metric: "",
    direction: "increase"
  });
  const [file, setFile] = useState(null);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = () => {
    onComplete(file, meta);
  };

  const steps = [
    { num: 1, title: "Metadata", icon: FileText },
    { num: 2, title: "Hypothesis", icon: Lightbulb },
    { num: 3, title: "Data", icon: UploadCloud },
    { num: 4, title: "Settings", icon: Settings },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress Bar */}
      <div className="mb-10 flex items-center justify-between px-8 relative">
        <div className="absolute top-1/2 left-16 right-16 h-px -translate-y-1/2 bg-slate-200 -z-10" />
        {steps.map((s, i) => (
          <div key={s.num} className="flex flex-col items-center gap-3 bg-slate-50 px-2">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${step >= s.num ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-200 bg-white text-slate-400'}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${step >= s.num ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      <Card className="p-8 shadow-sm border-slate-200">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Experiment Metadata</h2>
              <p className="mt-1 text-sm text-slate-500">Provide basic tracking details for your A/B test.</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Experiment Name</label>
                <input type="text" value={meta.name} onChange={e => setMeta({...meta, name: e.target.value})} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400" placeholder="e.g. Checkout Button Color" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Team</label>
                <input type="text" value={meta.team} onChange={e => setMeta({...meta, team: e.target.value})} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400" placeholder="e.g. Growth" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Start Date</label>
                  <input type="date" value={meta.startDate} onChange={e => setMeta({...meta, startDate: e.target.value})} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">End Date</label>
                  <input type="date" value={meta.endDate} onChange={e => setMeta({...meta, endDate: e.target.value})} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Hypothesis Builder</h2>
              <p className="mt-1 text-sm text-slate-500">Define what you tested and your expected outcome.</p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Hypothesis Statement</label>
                <textarea value={meta.hypothesis} onChange={e => setMeta({...meta, hypothesis: e.target.value})} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400" rows={4} placeholder="If we change X, then Y will happen because..." />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Primary Metric</label>
                  <input type="text" value={meta.metric} onChange={e => setMeta({...meta, metric: e.target.value})} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400" placeholder="e.g. Conversion Rate" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Expected Direction</label>
                  <select value={meta.direction} onChange={e => setMeta({...meta, direction: e.target.value})} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white">
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Upload Data</h2>
              <p className="mt-1 text-sm text-slate-500">Upload your event-level assignment CSV.</p>
            </div>
            <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-2">
              <FileUpload hideSubmit onFileSelect={(f) => setFile(f)} />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Analysis Configuration</h2>
              <p className="mt-1 text-sm text-slate-500">Fine-tune the statistical engine constraints.</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white transition hover:border-slate-300">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Apply CUPED</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Use pre-experiment data for variance reduction</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-slate-900 rounded" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white transition hover:border-slate-300">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">SRM Detection</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Run Chi-square test for sample ratio mismatch</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-slate-900 rounded" />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-white transition hover:border-slate-300">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Significance Level (Alpha)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Statistical confidence interval threshold</p>
                </div>
                <select className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-slate-50 font-medium">
                  <option>0.05 (95%)</option>
                  <option>0.01 (99%)</option>
                  <option>0.10 (90%)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-between border-t border-slate-100 pt-6">
          <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          {step < 4 ? (
            <Button onClick={handleNext} disabled={(step === 1 && !meta.name) || (step === 3 && !file)}>
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!file || loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {loading ? "Analyzing..." : "Run Analysis"} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
