import { Activity, BookOpen, Database, Gauge, Info, Network, Radio, Save, Wifi } from "lucide-react";
import { cn } from "../utils/cn";
import type { ConnectionType } from "../hooks/useNetworkStatus";

export type TabKey = "dashboard" | "statistics" | "database" | "sessions" | "documentation" | "about";

const TABS: { key: TabKey; label: string; icon: typeof Activity }[] = [
  { key: "dashboard", label: "Live Capture", icon: Radio },
  { key: "statistics", label: "Statistics", icon: Gauge },
  { key: "database", label: "SQL Database", icon: Database },
  { key: "sessions", label: "Sessions", icon: Save },
  { key: "documentation", label: "Documentation", icon: BookOpen },
  { key: "about", label: "About", icon: Info },
];

function NetworkBadge({ connectionType }: { connectionType: ConnectionType }) {
  const isEthernet = connectionType === "ethernet";
  const label = isEthernet ? "Ethernet (LAN)" : "Wi-Fi (Active)";
  const Icon = isEthernet ? Network : Wifi;

  return (
    <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function Navbar({
  active,
  onChange,
  isCapturing,
  connectionType,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  isCapturing: boolean;
  connectionType: ConnectionType;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-900/40">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-mono text-sm font-bold tracking-tight text-white sm:text-base">
              Simple<span className="text-emerald-400">Sniff</span>
            </p>
            <p className="hidden text-[11px] text-slate-400 sm:block">Educational Network Packet Analyzer</p>
          </div>
          <NetworkBadge connectionType={connectionType} />
          {isCapturing && (
            <span className="ml-2 flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Capturing
            </span>
          )}
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition sm:text-sm",
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
