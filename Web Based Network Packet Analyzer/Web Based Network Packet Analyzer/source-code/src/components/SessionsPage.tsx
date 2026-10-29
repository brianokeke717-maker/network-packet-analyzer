import { Download, FileJson, FolderOpen, Trash2 } from "lucide-react";
import type { CaptureSession } from "../types";
import { exportCsv, exportPcap } from "../lib/packetEngine";

export default function SessionsPage({
  sessions,
  onLoad,
  onDelete,
}: {
  sessions: CaptureSession[];
  onLoad: (s: CaptureSession) => void;
  onDelete: (id: string) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-center text-slate-500">
        <FolderOpen className="h-8 w-8" />
        <p className="text-sm">
          No saved sessions yet. Capture packets on the <span className="text-emerald-400">Live Capture</span> tab,
          then click <span className="text-emerald-400">Save Session</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-white">Saved Capture Sessions</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sessions.map((s) => {
          const durationSec = Math.max(0, Math.round((s.endTime - s.startTime) / 1000));
          return (
            <div key={s.id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div>
                <p className="truncate font-semibold text-white">{s.name}</p>
                <p className="text-[11px] text-slate-500">{new Date(s.startTime).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <span>
                  Interface: <span className="text-slate-200">{s.interfaceName}</span>
                </span>
                <span>
                  Packets: <span className="text-slate-200">{s.packets.length}</span>
                </span>
                <span>
                  Duration: <span className="text-slate-200">{durationSec}s</span>
                </span>
                <span className="truncate">
                  Filter: <span className="text-slate-200">{s.filterUsed || "none"}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-2">
                <button
                  onClick={() => onLoad(s)}
                  className="flex items-center gap-1 rounded-lg border border-emerald-600/50 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20"
                >
                  <FolderOpen className="h-3.5 w-3.5" /> View
                </button>
                <button
                  onClick={() => exportCsv(s.packets, `${s.name}.csv`)}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800"
                >
                  <Download className="h-3.5 w-3.5" /> CSV
                </button>
                <button
                  onClick={() => exportPcap(s.packets, `${s.name}.pcap`)}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800"
                >
                  <FileJson className="h-3.5 w-3.5" /> PCAP
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  className="ml-auto flex items-center gap-1 rounded-lg border border-rose-900/60 px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
