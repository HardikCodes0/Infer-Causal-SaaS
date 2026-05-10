import { NavLink } from "react-router-dom";
import {
  Upload,
  BarChart3,
  History,
  Settings,
  HelpCircle,
  FlaskConical,
} from "lucide-react";

const items = [
  { to: "/app", label: "Upload", icon: Upload, view: "upload" },
  { to: "/app", label: "Results", icon: BarChart3, view: "results" },
  { to: "/app", label: "History", icon: History, view: "history" },
];

export default function Sidebar({ activeView, onSelect }) {
  return (
    <aside
      className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 lg:flex"
      data-testid="sidebar"
    >
      <NavLink to="/" className="flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white">
          <FlaskConical className="h-4 w-4" />
        </div>
        <span className="font-display text-2xl italic leading-none text-slate-900">
          infer
        </span>
      </NavLink>

      <nav className="mt-10 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Workspace
        </p>
        {items.map((item) => {
          const active = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onSelect(item.view)}
              data-testid={`sidebar-${item.view}`}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-1 pt-6">
        <button 
          onClick={() => onSelect("help")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${activeView === 'help' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <HelpCircle className="h-4 w-4" />
          Help & docs
        </button>
        <button 
          onClick={() => onSelect("settings")}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${activeView === 'settings' ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
