import { AlertTriangle, Download, FileJson, Play, Save, Square, Trash2 } from "lucide-react";
import { INTERFACES } from "../lib/packetEngine";
import type { ConnectionType } from "../hooks/useNetworkStatus";

// Maps each interface ID to what physical connection type it actually needs
const INTERFACE_REQUIREMENTS: Record<string, { needs: ConnectionType | "any" | "loopback"; label: string }> = {
  eth0:  { needs: "ethernet", label: "Ethernet (LAN cable)" },
  wlan0: { needs: "wifi",     label: "Wi-Fi" },
  lo:    { needs: "loopback", label: "Loopback (always available)" },
  any:   { needs: "any",      label: "Any network connection" },
};

function getInterfaceError(interfaceId: string, connectionType: ConnectionType): string | null {
  // eth0 is inactive because no Ethernet (LAN) cable is plugged in
  if (interfaceId === "eth0") {
    return "Interface eth0 is inactive (no physical Ethernet cable connected). Please use wlan0 (Wi-Fi) to capture traffic.";
  }

  const req = INTERFACE_REQUIREMENTS[interfaceId];
  if (!req) return null;

  // Loopback and "any" always work
  if (req.needs === "loopback" || req.needs === "any") return null;

  // If we're offline entirely
  if (connectionType === "none") return "No network connection detected. Please connect to a network.";

  return null;
}

export default function ControlPanel({
  interfaceId,
  setInterfaceId,
  isCapturing,
  onStart,
  onStop,
  onClear,
  filter,
  setFilter,
  filterError,
  onExportCsv,
  onExportPcap,
  onSaveSession,
  packetCount,
  elapsed,
  rate,
  connectionType,
}: {
  interfaceId: string;
  setInterfaceId: (v: string) => void;
  isCapturing: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  filter: string;
  setFilter: (v: string) => void;
  filterError: string;
  onExportCsv: () => void;
  onExportPcap: () => void;
  onSaveSession: () => void;
  packetCount: number;
  elapsed: string;
  rate: number;
  connectionType: ConnectionType;
}) {
  const interfaceError = getInterfaceError(interfaceId, connectionType);
  const canStart = !interfaceError;

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Interface selector */}
        <div className="min-w-[220px] flex-1">
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Network Interface
          </label>
          <select
            value={interfaceId}
            disabled={isCapturing}
            onChange={(e) => setInterfaceId(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 disabled:opacity-50"
          >
            {INTERFACES.map((i) => (
              <option key={i.id} value={i.id} disabled={i.id === "eth0"}>
                {i.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filter input */}
        <div className="min-w-[280px] flex-[2]">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Filter expression (BPF-style)
            </label>
            <div className="flex items-center gap-1 text-[10px]">
              <span className="text-slate-500 hidden sm:inline">Presets:</span>
              {[
                { label: "TCP", expr: "tcp" },
                { label: "UDP", expr: "udp" },
                { label: "DNS", expr: "port 53" },
                { label: "HTTPS", expr: "port 443" },
                { label: "ICMP", expr: "icmp" },
                { label: "Reset", expr: "" },
              ].map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setFilter(q.expr)}
                  className={`rounded px-1.5 py-0.5 font-mono transition ${
                    filter === q.expr && q.expr !== ""
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="e.g. tcp, udp, port 53, host 192.168.1.5"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-emerald-500"
          />
          {filterError && <p className="mt-1 text-[11px] text-rose-400">{filterError}</p>}
        </div>

        {/* Start / Stop / Clear */}
        <div className="flex gap-2">
          {!isCapturing ? (
            <button
              onClick={onStart}
              disabled={!canStart}
              title={interfaceError ?? "Start capture"}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-4 w-4" /> Start
            </button>
          ) : (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-400"
            >
              <Square className="h-4 w-4" /> Stop
            </button>
          )}
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            title="Clear captured packets"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Interface mismatch warning */}
      {interfaceError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>{interfaceError}</p>
        </div>
      )}

      {/* Stats & Export row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
        <div className="flex flex-wrap gap-4 font-mono text-xs text-slate-400">
          <span>
            Packets: <span className="text-slate-100">{packetCount}</span>
          </span>
          <span>
            Elapsed: <span className="text-slate-100">{elapsed}</span>
          </span>
          <span>
            Rate: <span className="text-slate-100">{rate.toFixed(1)} pkt/s</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onSaveSession}
            disabled={packetCount === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-3.5 w-3.5" /> Save Session
          </button>
          <button
            onClick={onExportCsv}
            disabled={packetCount === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={onExportPcap}
            disabled={packetCount === 0}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FileJson className="h-3.5 w-3.5" /> Export PCAP
          </button>
        </div>
      </div>
    </div>
  );
}
