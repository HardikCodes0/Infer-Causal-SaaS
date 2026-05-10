import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Search, LogOut, Settings, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useRef, useEffect } from "react";

export default function Topbar({ latestRun, searchQuery, onSearch, setView }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const email = localStorage.getItem("email") || "";
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/auth");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur"
      data-testid="topbar"
    >
      <div className="flex items-center gap-3 w-1/3">
        {latestRun ? (
          <>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Project
            </span>
            <span className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">
              {latestRun.name}
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span className="hidden text-xs text-slate-500 sm:block whitespace-nowrap">
              Last run · {latestRun.timestamp ? formatDistanceToNow(new Date(latestRun.timestamp), { addSuffix: true }) : "Unknown"}
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Workspace
            </span>
            <span className="text-sm font-semibold text-slate-900">
              Personal
            </span>
          </>
        )}
      </div>

      <div className="hidden flex-1 px-10 md:flex justify-center">
        <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-slate-50/60 px-4 py-1.5 text-sm text-slate-500 focus-within:border-slate-300 focus-within:bg-white transition-colors shadow-sm">
          <Search className="h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search experiments…" 
            className="bg-transparent border-none outline-none w-full text-slate-900 placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => {
              onSearch(e.target.value);
              if (setView && e.target.value) setView("history");
            }}
          />
          <kbd className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-400 shadow-sm">
            /
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-4 w-1/3 justify-end">
        <Link
          to="/"
          className="hidden items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 sm:inline-flex transition-colors"
        >
          View site <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 text-xs font-semibold text-white cursor-pointer hover:shadow-md transition-shadow ring-2 ring-transparent focus:ring-emerald-200"
            title={`Account (${email})`}
          >
            {initial}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 z-50">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
                <p className="text-sm font-semibold text-slate-900 truncate" title={email}>{email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { setShowDropdown(false); if(setView) setView("settings"); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
