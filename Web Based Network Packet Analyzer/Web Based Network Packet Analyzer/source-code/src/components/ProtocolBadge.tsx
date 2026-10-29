import { cn } from "../utils/cn";
import type { ProtocolType } from "../types";

const COLORS: Record<ProtocolType, string> = {
  TCP: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  UDP: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  ICMP: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  ARP: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  DNS: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  HTTP: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  HTTPS: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  TLS: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

export default function ProtocolBadge({ protocol }: { protocol: ProtocolType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-semibold tracking-wide",
        COLORS[protocol]
      )}
    >
      {protocol}
    </span>
  );
}
