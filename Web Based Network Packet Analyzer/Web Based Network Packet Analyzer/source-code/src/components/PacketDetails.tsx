import { useState } from "react";
import type { Packet } from "../types";
import ProtocolBadge from "./ProtocolBadge";
import { hostLabel } from "../lib/packetEngine";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-800/60 py-1 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono text-slate-200">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-400">{title}</p>
      {children}
    </div>
  );
}

function HexDumpView({ hexStr, textPayload }: { hexStr: string; textPayload: string }) {
  const [viewMode, setViewMode] = useState<"hexdump" | "ascii">("hexdump");

  if (!hexStr || hexStr.trim() === "") {
    return <p className="text-[11px] text-slate-500 italic">No packet payload data</p>;
  }

  const bytes = hexStr.trim().split(/\s+/);
  const rows: { offset: string; hex1: string; hex2: string; ascii: string }[] = [];

  for (let i = 0; i < bytes.length; i += 16) {
    const chunk = bytes.slice(i, i + 16);
    const offset = i.toString(16).padStart(4, "0");
    const hex1 = chunk.slice(0, 8).join(" ");
    const hex2 = chunk.slice(8, 16).join(" ");
    const ascii = chunk
      .map((b) => {
        const code = parseInt(b, 16);
        return code >= 32 && code <= 126 ? String.fromCharCode(code) : ".";
      })
      .join("");

    rows.push({
      offset,
      hex1: hex1.padEnd(23, " "),
      hex2: hex2.padEnd(23, " "),
      ascii,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-[11px]">
        <span className="text-slate-400 font-mono">{bytes.length} bytes</span>
        <div className="flex rounded border border-slate-800 bg-slate-900 p-0.5 text-[10px]">
          <button
            onClick={() => setViewMode("hexdump")}
            className={`rounded px-2 py-0.5 ${
              viewMode === "hexdump" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-slate-400"
            }`}
          >
            Hex + ASCII
          </button>
          <button
            onClick={() => setViewMode("ascii")}
            className={`rounded px-2 py-0.5 ${
              viewMode === "ascii" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-slate-400"
            }`}
          >
            Text
          </button>
        </div>
      </div>

      {viewMode === "hexdump" ? (
        <div className="overflow-x-auto rounded bg-slate-950 p-2 font-mono text-[11px] text-slate-300 leading-relaxed border border-slate-900 select-text">
          <div className="text-[10px] text-slate-500 mb-1 border-b border-slate-800/80 pb-0.5">
            Offset&nbsp;&nbsp;00 01 02 03 04 05 06 07&nbsp;&nbsp;08 09 0a 0b 0c 0d 0e 0f&nbsp;&nbsp;ASCII
          </div>
          {rows.map((row, idx) => (
            <div key={idx} className="whitespace-pre flex">
              <span className="text-slate-500 select-none mr-2">{row.offset}</span>
              <span className="text-emerald-300 mr-2">{row.hex1}</span>
              <span className="text-teal-300 mr-3">{row.hex2}</span>
              <span className="text-slate-400 border-l border-slate-800 pl-2">{row.ascii}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto rounded bg-slate-950 p-2 font-mono text-[11px] text-slate-300 whitespace-pre-wrap border border-slate-900 select-text">
          {textPayload || "—"}
        </div>
      )}
    </div>
  );
}

export default function PacketDetails({ packet }: { packet: Packet | null }) {
  if (!packet) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-500">
        Select a packet from the list to inspect its header fields and payload.
      </div>
    );
  }

  const transportLabel = ["TCP", "HTTP", "HTTPS", "TLS"].includes(packet.protocol)
    ? "TCP"
    : packet.protocol === "DNS" || packet.protocol === "UDP"
    ? "UDP"
    : packet.protocol === "ICMP"
    ? "ICMP"
    : null;

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Packet #{packet.no}</h3>
        <ProtocolBadge protocol={packet.protocol} />
      </div>
      <p className="text-xs text-slate-400">{packet.info}</p>

      <Section title="Frame / Ethernet II">
        <Row label="Arrival time" value={new Date(packet.timestamp).toLocaleString()} />
        <Row label="Frame length" value={`${packet.length} bytes (${packet.length * 8} bits)`} />
        <Row label="Source MAC" value={packet.srcMac} />
        <Row label="Destination MAC" value={packet.dstMac} />
      </Section>

      {packet.protocol !== "ARP" ? (
        <Section title="Internet Protocol Version 4 (IPv4)">
          <Row label="Source IP" value={`${packet.srcIp} (${hostLabel(packet.srcIp)})`} />
          <Row label="Destination IP" value={`${packet.dstIp} (${hostLabel(packet.dstIp)})`} />
          <Row label="Time to Live (TTL)" value={`${packet.ttl} hops`} />
          <Row
            label="Layer 4 Protocol"
            value={transportLabel === "TCP" ? "6 (TCP)" : transportLabel === "UDP" ? "17 (UDP)" : "1 (ICMP)"}
          />
        </Section>
      ) : (
        <Section title="Address Resolution Protocol (ARP)">
          <Row label="Sender IP" value={packet.srcIp} />
          <Row label="Sender MAC" value={packet.srcMac} />
          <Row label="Target IP" value={packet.dstIp} />
          <Row label="Target MAC" value={packet.dstMac} />
        </Section>
      )}

      {transportLabel === "TCP" && (
        <Section title="Transmission Control Protocol (TCP)">
          <Row label="Source Port" value={packet.srcPort} />
          <Row label="Destination Port" value={packet.dstPort} />
          <Row label="Control Flags" value={packet.flags.join(", ") || "ACK"} />
        </Section>
      )}
      {transportLabel === "UDP" && (
        <Section title="User Datagram Protocol (UDP)">
          <Row label="Source Port" value={packet.srcPort} />
          <Row label="Destination Port" value={packet.dstPort} />
        </Section>
      )}
      {transportLabel === "ICMP" && (
        <Section title="Internet Control Message Protocol (ICMP)">
          <Row label="Control Message" value={packet.info.includes("reply") ? "Type 0 (Echo Reply)" : "Type 8 (Echo Request)"} />
        </Section>
      )}

      <Section title="Packet Payload Inspection">
        <HexDumpView hexStr={packet.payloadHex} textPayload={packet.payload} />
      </Section>
    </div>
  );
}
