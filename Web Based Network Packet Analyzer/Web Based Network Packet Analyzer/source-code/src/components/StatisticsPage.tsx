import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Packet } from "../types";
import { hostLabel } from "../lib/packetEngine";

const PROTO_COLORS: Record<string, string> = {
  TCP: "#3b82f6",
  UDP: "#a855f7",
  ICMP: "#f59e0b",
  ARP: "#f43f5e",
  DNS: "#14b8a6",
  HTTP: "#0ea5e9",
  HTTPS: "#10b981",
  TLS: "#10b981",
};

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

export default function StatisticsPage({ packets }: { packets: Packet[] }) {
  const protocolData = useMemo(() => {
    const counts: Record<string, number> = {};
    packets.forEach((p) => {
      counts[p.protocol] = (counts[p.protocol] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [packets]);

  const talkers = useMemo(() => {
    const counts: Record<string, number> = {};
    packets.forEach((p) => {
      counts[p.srcIp] = (counts[p.srcIp] || 0) + 1;
      counts[p.dstIp] = (counts[p.dstIp] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([ip, count]) => ({ ip: `${ip}`, label: hostLabel(ip), count }));
  }, [packets]);

  const topPorts = useMemo(() => {
    const counts: Record<string, number> = {};
    packets.forEach((p) => {
      if (p.dstPort) counts[p.dstPort] = (counts[p.dstPort] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([port, count]) => ({ port, count }));
  }, [packets]);

  const timelineData = useMemo(() => {
    if (packets.length === 0) return [];
    const secMap: Record<number, { time: string; packets: number; kb: number }> = {};
    packets.forEach((p) => {
      const s = Math.floor(p.relTime);
      const mm = String(Math.floor(s / 60)).padStart(2, "0");
      const ss = String(s % 60).padStart(2, "0");
      const label = `${mm}:${ss}`;
      if (!secMap[s]) {
        secMap[s] = { time: label, packets: 0, kb: 0 };
      }
      secMap[s].packets += 1;
      secMap[s].kb = parseFloat((secMap[s].kb + p.length / 1024).toFixed(2));
    });
    return Object.values(secMap).slice(-40); // show last 40 seconds
  }, [packets]);

  const totalBytes = packets.reduce((sum, p) => sum + p.length, 0);
  const avgLength = packets.length ? Math.round(totalBytes / packets.length) : 0;

  if (packets.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 text-sm text-slate-500">
        No packet data available yet. Start a capture on the Live Capture tab to generate statistics.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Packets" value={packets.length} />
        <StatCard label="Total Volume" value={`${(totalBytes / 1024).toFixed(1)} KB`} hint={`${totalBytes.toLocaleString()} bytes`} />
        <StatCard label="Avg Packet Size" value={`${avgLength} B`} />
        <StatCard label="Unique Protocols" value={protocolData.length} />
      </div>

      {/* Traffic Throughput Timeline */}
      {timelineData.length > 1 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Traffic Activity Timeline (Throughput)</h3>
            <span className="text-[11px] text-slate-400">Packets / sec &amp; KB / sec</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 12 }} />
              <Area type="monotone" dataKey="packets" stroke="#10b981" fillOpacity={1} fill="url(#colorPackets)" name="Packets/s" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Protocol Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={protocolData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {protocolData.map((entry) => (
                  <Cell key={entry.name} fill={PROTO_COLORS[entry.name] || "#64748b"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Top Talkers (by IP Address)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={talkers} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="ip" type="category" stroke="#64748b" fontSize={10} width={110} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 12 }}
                formatter={(value: unknown, _name: unknown, item: { payload?: { label?: string } }) => [
                  value as number,
                  item?.payload?.label ?? "",
                ]}
              />
              <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} name="Packet Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-white">Top Destination Ports</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topPorts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="port" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", fontSize: 12 }} />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Packets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
