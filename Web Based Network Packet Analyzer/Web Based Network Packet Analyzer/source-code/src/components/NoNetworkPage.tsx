import { Activity, RefreshCw, WifiOff } from "lucide-react";

export default function NoNetworkPage({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
      {/* Logo */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-900/50">
        <Activity className="h-9 w-9 text-white" />
      </div>

      {/* App name */}
      <p className="mb-8 font-mono text-lg font-bold tracking-tight text-white">
        Simple<span className="text-emerald-400">Sniff</span>
      </p>

      {/* No network icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10">
        <WifiOff className="h-10 w-10 text-rose-400" />
      </div>

      {/* Heading */}
      <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
        No Network Connection
      </h1>

      {/* Description */}
      <p className="mb-2 max-w-md text-sm leading-relaxed text-slate-400">
        SimpleSniff requires an active <span className="font-semibold text-slate-200">Ethernet</span> or{" "}
        <span className="font-semibold text-slate-200">Wi-Fi</span> connection to operate.
      </p>
      <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-500">
        A packet analyzer must be connected to a network interface to capture and inspect traffic.
        Please connect to a network and try again.
      </p>

      {/* Steps */}
      <div className="mb-8 w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-left">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          What to do
        </p>
        <ol className="space-y-2 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-400">1</span>
            Plug in your Ethernet cable, or turn on Wi-Fi on your device.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-400">2</span>
            Ensure you are connected to your local network (e.g. home router or lab switch).
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-bold text-emerald-400">3</span>
            Click <span className="font-semibold text-white">Retry</span> below to reconnect.
          </li>
        </ol>
      </div>

      {/* Retry button */}
      <button
        onClick={onRetry}
        className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950 transition hover:bg-emerald-400 active:scale-95"
      >
        <RefreshCw className="h-4 w-4" />
        Retry Connection
      </button>

      <p className="mt-8 text-[11px] text-slate-700">
        SimpleSniff — Educational Network Packet Analyzer
      </p>
    </div>
  );
}
