import { useRef, useState } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FileUpload({ onAnalyse, loading, onFileSelect, hideSubmit }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const pick = (f) => {
    if (f && f.name.toLowerCase().endsWith(".csv")) {
      setFile(f);
      if (onFileSelect) onFileSelect(f);
    }
  };

  return (
    <div className="space-y-5" data-testid="file-upload-section">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        data-testid="dropzone"
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-dashed p-12 text-center transition ${
          dragOver
            ? "border-emerald-500 bg-emerald-50/40"
            : "border-slate-300 bg-gradient-to-b from-white to-slate-50/50 hover:border-slate-400"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p
                className="text-sm font-medium text-slate-900"
                data-testid="selected-filename"
              >
                {file.name}
              </p>
              <p className="text-xs text-slate-500">
                {(file.size / 1024).toFixed(1)} KB · ready to analyse
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                if (onFileSelect) onFileSelect(null);
              }}
              className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              data-testid="clear-file"
              aria-label="Clear file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm transition group-hover:scale-105">
              <Upload className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <p className="text-sm">
                <span className="font-medium text-slate-900">
                  Drop your CSV
                </span>{" "}
                or click to browse
              </p>
              <p className="mt-1 text-xs text-slate-400">
                user_id · variant · metric · (optional segment, pre_metric)
              </p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          data-testid="file-input"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          We never store your data — analysis runs in-memory.
        </p>
        {!hideSubmit && (
          <Button
            onClick={() => onAnalyse(file)}
            disabled={!file || loading}
            data-testid="analyse-button"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysing experiment…
              </>
            ) : (
              "Analyse experiment"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
