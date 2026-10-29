import { useState } from "react";
import { Save, X, HardDrive, Filter, Clock } from "lucide-react";

interface SaveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionName: string) => void;
  packetCount: number;
  interfaceName: string;
  filterUsed: string;
  elapsedTime: string;
}

export default function SaveSessionModal({
  isOpen,
  onClose,
  onConfirm,
  packetCount,
  interfaceName,
  filterUsed,
  elapsedTime,
}: SaveSessionModalProps) {
  const [name, setName] = useState(
    () => `Capture Session - ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm(name.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-emerald-950/40">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Save className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-white">Save Capture Session</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Session Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wi-Fi HTTP Traffic Investigation"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {/* Session Overview Stats */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <HardDrive className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Packets: <strong className="text-white font-mono">{packetCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span>Duration: <strong className="text-white font-mono">{elapsedTime}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 col-span-2">
              <span className="text-slate-500 font-mono">NIC:</span>
              <span className="text-slate-300 font-mono">{interfaceName}</span>
              {filterUsed && (
                <>
                  <span className="text-slate-600">|</span>
                  <Filter className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="text-slate-300 font-mono truncate">{filterUsed}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition shadow-lg shadow-emerald-950"
            >
              <Save className="h-3.5 w-3.5" />
              Save Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
