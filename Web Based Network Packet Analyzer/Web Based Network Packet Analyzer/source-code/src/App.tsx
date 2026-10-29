import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar, { type TabKey } from "./components/Navbar";
import ControlPanel from "./components/ControlPanel";
import PacketTable from "./components/PacketTable";
import PacketDetails from "./components/PacketDetails";
import StatisticsPage from "./components/StatisticsPage";
import SqlDatabasePage from "./components/SqlDatabasePage";
import SessionsPage from "./components/SessionsPage";
import DocumentationPage from "./components/DocumentationPage";
import AboutPage from "./components/AboutPage";
import NoNetworkPage from "./components/NoNetworkPage";
import SaveSessionModal from "./components/SaveSessionModal";
import { CheckCircle2 } from "lucide-react";
import { useNetworkStatus, type ConnectionType } from "./hooks/useNetworkStatus";
import type { CaptureSession, Packet } from "./types";
import { exportCsv, exportPcap, generatePacket, matchesFilter, resetPacketCounter } from "./lib/packetEngine";

const STORAGE_KEY = "simplesniff.sessions.v1";
const MAX_PACKETS = 3000;

function loadSessions(): CaptureSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CaptureSession[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const { isOnline, connectionType } = useNetworkStatus();
  const [retryKey, setRetryKey] = useState(0);

  // Block the entire app if there is no network connection
  if (!isOnline) {
    return <NoNetworkPage onRetry={() => setRetryKey((k) => k + 1)} />;
  }

  return <AppInner key={retryKey} connectionType={connectionType} />;
}

function AppInner({ connectionType }: { connectionType: ConnectionType }) {
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [interfaceId, setInterfaceId] = useState("wlan0");
  const [isCapturing, setIsCapturing] = useState(false);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [filter, setFilter] = useState("");
  const [filterError, setFilterError] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [captureStart, setCaptureStart] = useState<number>(Date.now());
  const [elapsedLabel, setElapsedLabel] = useState("00:00:00");
  const [rate, setRate] = useState(0);
  const [sessions, setSessions] = useState<CaptureSession[]>(() => loadSessions());
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recentCountRef = useRef<{ t: number }[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn("Storage quota exceeded or unavailable:", e);
    }
  }, [sessions]);

  const startCapture = useCallback(() => {
    resetPacketCounter();
    setPackets([]);
    setSelectedId(null);
    const start = Date.now();
    setCaptureStart(start);
    setIsCapturing(true);

    intervalRef.current = setInterval(() => {
      const burst = Math.random() > 0.7 ? 2 : 1;
      setPackets((prev) => {
        const next = [...prev];
        for (let i = 0; i < burst; i++) {
          next.push(generatePacket(start));
        }
        recentCountRef.current.push({ t: Date.now() });
        if (next.length > MAX_PACKETS) {
          next.splice(0, next.length - MAX_PACKETS);
        }
        return next;
      });
    }, 350);

    tickRef.current = setInterval(() => {
      const now = Date.now();
      const secs = Math.floor((now - start) / 1000);
      const hh = String(Math.floor(secs / 3600)).padStart(2, "0");
      const mm = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
      const ss = String(secs % 60).padStart(2, "0");
      setElapsedLabel(`${hh}:${mm}:${ss}`);

      recentCountRef.current = recentCountRef.current.filter((e) => now - e.t < 5000);
      setRate(recentCountRef.current.length / 5);
    }, 500);
  }, []);

  const stopCapture = useCallback(() => {
    setIsCapturing(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const clearPackets = useCallback(() => {
    setPackets([]);
    setSelectedId(null);
    resetPacketCounter();
    setElapsedLabel("00:00:00");
    setRate(0);
  }, []);

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setFilterError("");
  };

  const filteredPackets = useMemo(() => {
    try {
      const result = packets.filter((p) => matchesFilter(p, filter));
      if (filterError) setFilterError("");
      return result;
    } catch {
      setFilterError("Invalid filter expression");
      return packets;
    }
  }, [packets, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPacket = filteredPackets.find((p) => p.id === selectedId) || null;

  const handleSaveSession = () => {
    if (packets.length === 0) {
      alert("No packets captured yet. Click 'Start' on Live Capture to capture packets before saving.");
      return;
    }
    setIsSaveModalOpen(true);
  };

  const confirmSaveSession = (sessionName: string) => {
    const session: CaptureSession = {
      id: `${Date.now()}`,
      name: sessionName,
      interfaceName: interfaceId,
      filterUsed: filter,
      startTime: captureStart,
      endTime: Date.now(),
      packets: [...packets],
    };
    setSessions((prev) => [session, ...prev]);
    setToastMessage(`Session "${sessionName}" saved successfully!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleLoadSession = (s: CaptureSession) => {
    stopCapture();
    setPackets(s.packets);
    setInterfaceId(s.interfaceName);
    setFilter(s.filterUsed);
    setCaptureStart(s.startTime);
    setSelectedId(null);
    setTab("dashboard");
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar active={tab} onChange={setTab} isCapturing={isCapturing} connectionType={connectionType} />

      <main className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        {tab === "dashboard" && (
          <div className="flex flex-col gap-4">
            <ControlPanel
              interfaceId={interfaceId}
              setInterfaceId={setInterfaceId}
              isCapturing={isCapturing}
              onStart={startCapture}
              onStop={stopCapture}
              onClear={clearPackets}
              filter={filter}
              setFilter={handleFilterChange}
              filterError={filterError}
              onExportCsv={() => exportCsv(filteredPackets, "capture.csv")}
              onExportPcap={() => exportPcap(filteredPackets, "capture.pcap")}
              onSaveSession={handleSaveSession}
              packetCount={filteredPackets.length}
              elapsed={elapsedLabel}
              rate={rate}
              connectionType={connectionType}
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing <span className="text-slate-200">{filteredPackets.length}</span> of{" "}
                <span className="text-slate-200">{packets.length}</span> packets
              </p>
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-700 bg-slate-900 accent-emerald-500"
                />
                Auto-scroll
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_380px]">
              <div className="h-[55vh] lg:h-[62vh]">
                <PacketTable
                  packets={filteredPackets}
                  selectedId={selectedId}
                  onSelect={(p) => setSelectedId(p.id)}
                  autoScroll={autoScroll}
                />
              </div>
              <div className="h-[55vh] lg:h-[62vh]">
                <PacketDetails packet={selectedPacket} />
              </div>
            </div>
          </div>
        )}

        {tab === "statistics" && <StatisticsPage packets={filteredPackets} />}

        {tab === "database" && <SqlDatabasePage packets={packets} sessions={sessions} />}

        {tab === "sessions" && (
          <SessionsPage sessions={sessions} onLoad={handleLoadSession} onDelete={handleDeleteSession} />
        )}

        {tab === "documentation" && <DocumentationPage />}

        {tab === "about" && <AboutPage />}
      </main>

      {/* Save Session Modal */}
      <SaveSessionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={confirmSaveSession}
        packetCount={packets.length}
        interfaceName={interfaceId}
        filterUsed={filter}
        elapsedTime={elapsedLabel}
      />

      {/* Success Notification Toast */}
      {toastMessage && (
        <div
          onClick={() => {
            setTab("sessions");
            setToastMessage(null);
          }}
          className="fixed bottom-6 right-6 z-50 flex cursor-pointer items-center gap-3 rounded-xl border border-emerald-500/50 bg-slate-900/95 p-4 shadow-2xl shadow-emerald-950/60 backdrop-blur transition hover:scale-105"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-300">{toastMessage}</p>
            <p className="text-[11px] text-slate-400">Click to view in Sessions tab &rarr;</p>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        Simple Network Packet Analyzer &bull; Department of Computer Science &bull; University of Nigeria, Nsukka
      </footer>
    </div>
  );
}
