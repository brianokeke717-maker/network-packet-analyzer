import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  Clock,
  Code,
  Copy,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Play,
  RefreshCw,
  Sparkles,
  Table,
  Upload,
} from "lucide-react";
import {
  PREDEFINED_QUERIES,
  PredefinedQuery,
  QueryResult,
  executeQuery,
  exportDatabaseFile,
  importDatabaseFile,
  syncPacketsToDatabase,
  syncSessionsToDatabase,
} from "../lib/packetDatabase";
import type { CaptureSession, Packet } from "../types";

interface SqlDatabasePageProps {
  packets: Packet[];
  sessions: CaptureSession[];
}

const TABLE_SCHEMAS = [
  {
    name: "packets",
    description: "All captured network frames with parsed headers, IPs, ports, and payloads",
    columns: [
      { name: "id", type: "INTEGER", pk: true },
      { name: "no", type: "INTEGER" },
      { name: "timestamp", type: "INTEGER" },
      { name: "rel_time", type: "REAL" },
      { name: "src_mac", type: "TEXT" },
      { name: "dst_mac", type: "TEXT" },
      { name: "src_ip", type: "TEXT" },
      { name: "dst_ip", type: "TEXT" },
      { name: "src_port", type: "INTEGER" },
      { name: "dst_port", type: "INTEGER" },
      { name: "protocol", type: "TEXT" },
      { name: "length", type: "INTEGER" },
      { name: "ttl", type: "INTEGER" },
      { name: "flags", type: "TEXT" },
      { name: "info", type: "TEXT" },
      { name: "payload", type: "TEXT" },
      { name: "payload_hex", type: "TEXT" },
      { name: "created_at", type: "DATETIME" },
    ],
  },
  {
    name: "sessions",
    description: "Saved packet capture sessions and metadata",
    columns: [
      { name: "id", type: "TEXT", pk: true },
      { name: "name", type: "TEXT" },
      { name: "interface_name", type: "TEXT" },
      { name: "filter_used", type: "TEXT" },
      { name: "start_time", type: "INTEGER" },
      { name: "end_time", type: "INTEGER" },
      { name: "packet_count", type: "INTEGER" },
      { name: "created_at", type: "DATETIME" },
    ],
  },
];

export default function SqlDatabasePage({ packets, sessions }: SqlDatabasePageProps) {
  const [query, setQuery] = useState(PREDEFINED_QUERIES[0].sql);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(PREDEFINED_QUERIES[0].id);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedCount, setLastSyncedCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-sync packets and sessions when arriving at the page or packets change
  useEffect(() => {
    let isMounted = true;
    const sync = async () => {
      try {
        setIsSyncing(true);
        await syncPacketsToDatabase(packets);
        await syncSessionsToDatabase(sessions);
        if (isMounted) {
          setLastSyncedCount(packets.length);
        }
      } catch (err: any) {
        console.error("Database sync error:", err);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    sync();
    return () => {
      isMounted = false;
    };
  }, [packets, sessions]);

  // Initial query execution on mount
  useEffect(() => {
    handleRunQuery(PREDEFINED_QUERIES[0].sql);
  }, []);

  const handleRunQuery = async (sqlToRun?: string) => {
    const targetQuery = (sqlToRun ?? query).trim();
    if (!targetQuery) return;

    setIsExecuting(true);
    setError(null);
    try {
      const res = await executeQuery(targetQuery);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "An unknown SQL execution error occurred.");
      setResult(null);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSelectTemplate = (template: PredefinedQuery) => {
    setSelectedTemplate(template.id);
    setQuery(template.sql);
    handleRunQuery(template.sql);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncPacketsToDatabase(packets);
      await syncSessionsToDatabase(sessions);
      setLastSyncedCount(packets.length);
      await handleRunQuery();
    } catch (err: any) {
      setError("Sync failed: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportSqlite = async () => {
    try {
      const data = await exportDatabaseFile();
      const blob = new Blob([data as unknown as BlobPart], { type: "application/x-sqlite3" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `packets_database_${Date.now()}.sqlite`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to export database: " + err.message);
    }
  };

  const handleImportSqlite = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      await importDatabaseFile(new Uint8Array(arrayBuffer));
      alert("Database imported successfully!");
      handleRunQuery();
    } catch (err: any) {
      alert("Error importing database: " + err.message);
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleExportCsv = () => {
    if (!result || result.values.length === 0) return;
    const csvRows: string[] = [];
    csvRows.push(result.columns.map((col) => `"${col}"`).join(","));

    for (const row of result.values) {
      const formatted = row.map((val) => {
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(formatted.join(","));
    }

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    if (!result || result.values.length === 0) return;
    const jsonList = result.values.map((row) => {
      const obj: Record<string, any> = {};
      result.columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(jsonList, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_result_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered rows for the results search bar
  const filteredRows = result?.values.filter((row) => {
    if (!searchTerm) return true;
    return row.some((cell) =>
      cell !== null && cell !== undefined && String(cell).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & DB Controls */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white sm:text-lg flex items-center gap-2">
              SQLite Packet Database
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono text-emerald-300">
                WASM In-Memory
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Query captured network traffic with full SQL syntax, aggregations, joins, and filters.
            </p>
          </div>
        </div>

        {/* Database Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            title="Reload current capture packets into SQLite"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-emerald-400" : ""}`} />
            Sync Packets ({lastSyncedCount})
          </button>

          <button
            onClick={handleExportSqlite}
            title="Download full SQLite .sqlite database file"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            Export .sqlite
          </button>

          <label
            title="Open an existing SQLite .sqlite database"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <Upload className="h-3.5 w-3.5 text-amber-400" />
            Import .sqlite
            <input
              ref={fileInputRef}
              type="file"
              accept=".sqlite,.db"
              onChange={handleImportSqlite}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Grid: Query Catalog & SQL Editor */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Column: Preset Queries Catalog & Schema */}
        <div className="flex flex-col gap-5">
          {/* Preset Queries */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Query Library
              </span>
              <span className="text-[11px] text-slate-500">{PREDEFINED_QUERIES.length} Presets</span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[380px] overflow-y-auto pr-1">
              {PREDEFINED_QUERIES.map((preset) => {
                const isSelected = selectedTemplate === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectTemplate(preset)}
                    className={`flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition ${
                      isSelected
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                        : "border-slate-800/80 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-medium text-white">{preset.title}</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-400">
                        {preset.category}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[11px] text-slate-400 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Database Schema Explorer */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Table className="h-3.5 w-3.5 text-cyan-400" />
                Schema Explorer
              </span>
              <span className="text-[11px] text-slate-500">2 Tables</span>
            </div>

            <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1 text-xs">
              {TABLE_SCHEMAS.map((tbl) => (
                <div key={tbl.name} className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-emerald-400">{tbl.name}</span>
                    <span className="text-[10px] text-slate-500">{tbl.columns.length} cols</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{tbl.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {tbl.columns.map((col) => (
                      <button
                        key={col.name}
                        onClick={() => {
                          setQuery((prev) => prev + ` ${col.name}`);
                        }}
                        title={`Click to insert column into query (${col.type}${col.pk ? ", PRIMARY KEY" : ""})`}
                        className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 transition"
                      >
                        {col.name}
                        <span className="ml-1 text-[9px] text-slate-500">{col.type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: SQL Editor & Results */}
        <div className="flex flex-col gap-4">
          {/* Query Editor Box */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  SQL Query Editor
                </span>
                <span className="hidden sm:inline text-[11px] text-slate-500">
                  (Supports SQLite standard dialect)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyQuery}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
                  title="Copy SQL Query"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={() => setQuery("SELECT * FROM packets LIMIT 25;")}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Textarea for SQL */}
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedTemplate("");
                }}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleRunQuery();
                  }
                }}
                rows={7}
                placeholder="Write your SQL query here (e.g. SELECT protocol, COUNT(*) FROM packets GROUP BY protocol;)"
                className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Editor Action Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                  Ctrl + Enter
                </kbd>
                <span>to execute</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunQuery()}
                  disabled={isExecuting}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {isExecuting ? "Executing..." : "Run Query"}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold">SQL Error</p>
                <p className="font-mono text-[11px] mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Query Results Section */}
          <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            {/* Results Header */}
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <Table className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Query Results
                </h3>
                {result && (
                  <span className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="h-3 w-3 text-emerald-400" />
                    {result.rowCount} {result.rowCount === 1 ? "row" : "rows"} in {result.executionTimeMs} ms
                  </span>
                )}
              </div>

              {/* Search & Export Buttons */}
              {result && result.rowCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search results..."
                    className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleExportCsv}
                    title="Export query results as CSV"
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    <FileSpreadsheet className="h-3 w-3 text-emerald-400" />
                    CSV
                  </button>
                  <button
                    onClick={handleExportJson}
                    title="Export query results as JSON"
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    <FileText className="h-3 w-3 text-amber-400" />
                    JSON
                  </button>
                </div>
              )}
            </div>

            {/* Results Table Area */}
            {!result ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 text-center p-6 text-slate-500">
                <Database className="h-8 w-8 mb-2 opacity-40 text-slate-400" />
                <p className="text-xs">No active query result.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Choose a preset query or click "Run Query" above.
                </p>
              </div>
            ) : result.columns.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-slate-800/80 bg-slate-950/40 text-center p-4">
                <p className="text-xs text-emerald-400 font-medium">Query executed successfully.</p>
                <p className="text-[11px] text-slate-500 mt-1">No rows or columns returned.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-800 max-h-[440px] overflow-y-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2 px-3 text-[11px] font-semibold text-slate-500 w-12 text-center">#</th>
                      {result.columns.map((col, idx) => (
                        <th key={idx} className="py-2 px-3 font-semibold text-slate-300">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={result.columns.length + 1}
                          className="py-6 text-center text-xs text-slate-500"
                        >
                          No matching rows found.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-800/50 transition">
                          <td className="py-1.5 px-3 text-[10px] text-slate-600 text-center select-none">
                            {rIdx + 1}
                          </td>
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className="py-1.5 px-3 text-slate-300 whitespace-nowrap max-w-xs truncate"
                              title={cell !== null ? String(cell) : "NULL"}
                            >
                              {cell === null || cell === undefined ? (
                                <span className="text-slate-600 italic">NULL</span>
                              ) : (
                                String(cell)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
