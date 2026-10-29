import { useEffect, useRef } from "react";
import type { Packet } from "../types";
import ProtocolBadge from "./ProtocolBadge";
import { cn } from "../utils/cn";

export default function PacketTable({
  packets,
  selectedId,
  onSelect,
  autoScroll,
}: {
  packets: Packet[];
  selectedId: number | null;
  onSelect: (p: Packet) => void;
  autoScroll: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [packets.length, autoScroll]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <div className="grid grid-cols-[56px_110px_1fr_1fr_80px_70px_1.4fr] gap-2 border-b border-slate-800 bg-slate-950/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <span>No.</span>
        <span>Time</span>
        <span>Source</span>
        <span>Destination</span>
        <span>Proto</span>
        <span>Len</span>
        <span>Info</span>
      </div>
      <div className="flex-1 overflow-y-auto font-mono text-[12.5px]">
        {packets.length === 0 && (
          <div className="flex h-full items-center justify-center p-10 text-center text-sm text-slate-500">
            Select an interface above and click{" "}
            <span className="mx-1 font-semibold text-emerald-400">Start</span>{" "}
            to begin capturing packets.
          </div>
        )}
        {packets.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelect(p)}
            className={cn(
              "grid cursor-pointer grid-cols-[56px_110px_1fr_1fr_80px_70px_1.4fr] gap-2 border-b border-slate-800/60 px-3 py-1.5 hover:bg-slate-800/50",
              selectedId === p.id && "bg-emerald-500/10 hover:bg-emerald-500/15"
            )}
          >
            <span className="text-slate-500">{p.no}</span>
            <span className="text-slate-400">{new Date(p.timestamp).toLocaleTimeString([], { hour12: false })}.{String(p.timestamp % 1000).padStart(3, "0")}</span>
            <span className="truncate text-sky-300">{p.srcIp}{p.srcPort ? `:${p.srcPort}` : ""}</span>
            <span className="truncate text-violet-300">{p.dstIp}{p.dstPort ? `:${p.dstPort}` : ""}</span>
            <span>
              <ProtocolBadge protocol={p.protocol} />
            </span>
            <span className="text-slate-400">{p.length}</span>
            <span className="truncate text-slate-300">{p.info}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
