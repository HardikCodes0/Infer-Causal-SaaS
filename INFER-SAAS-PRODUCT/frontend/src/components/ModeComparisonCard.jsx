import React from 'react';
import { Card } from "@/components/ui/card";
import { Check, X, Shield, Zap, Globe, HardDrive } from "lucide-react";

export default function ModeComparisonCard() {
  return (
    <Card className="overflow-hidden border border-slate-200">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-600" />
          Execution Modes
        </h3>
        <p className="text-xs text-slate-500 mt-1">Choose how your data is processed.</p>
      </div>
      <table className="w-full text-sm text-left">
        <thead className="bg-white border-b border-slate-100">
          <tr>
            <th className="px-4 py-3 font-medium text-slate-500">Feature</th>
            <th className="px-4 py-3 font-semibold text-slate-900 border-l border-slate-100 w-1/3 text-center bg-slate-50/50">Standard</th>
            <th className="px-4 py-3 font-semibold text-emerald-700 border-l border-slate-100 w-1/3 text-center bg-emerald-50/30">Privacy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-4 py-3 text-slate-600 flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400"/> Analysis speed</td>
            <td className="px-4 py-3 text-center border-l border-slate-100">Fast</td>
            <td className="px-4 py-3 text-center border-l border-slate-100 font-medium text-emerald-700">~15s first load</td>
          </tr>
          <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-4 py-3 text-slate-600 flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400"/> Data sent to server</td>
            <td className="px-4 py-3 text-center border-l border-slate-100 text-rose-600">Yes</td>
            <td className="px-4 py-3 text-center border-l border-slate-100 font-medium text-emerald-700">Never</td>
          </tr>
          <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-4 py-3 text-slate-600 flex items-center gap-2"><Shield className="w-4 h-4 text-slate-400"/> GDPR compliant</td>
            <td className="px-4 py-3 text-center border-l border-slate-100">Partial</td>
            <td className="px-4 py-3 text-center border-l border-slate-100 font-medium text-emerald-700">Full</td>
          </tr>
          <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-4 py-3 text-slate-600 flex items-center gap-2"><HardDrive className="w-4 h-4 text-slate-400"/> Works offline</td>
            <td className="px-4 py-3 text-center border-l border-slate-100">
              <X className="w-4 h-4 text-rose-500 mx-auto" />
            </td>
            <td className="px-4 py-3 text-center border-l border-slate-100 text-emerald-600">
              <span className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> <span className="text-xs">(after load)</span></span>
            </td>
          </tr>
          <tr className="hover:bg-slate-50/50 transition-colors">
            <td className="px-4 py-3 text-slate-600 flex items-center gap-2"><Check className="w-4 h-4 text-slate-400"/> All features</td>
            <td className="px-4 py-3 text-center border-l border-slate-100">
              <Check className="w-4 h-4 text-slate-400 mx-auto" />
            </td>
            <td className="px-4 py-3 text-center border-l border-slate-100">
              <Check className="w-4 h-4 text-emerald-600 mx-auto" />
            </td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}
