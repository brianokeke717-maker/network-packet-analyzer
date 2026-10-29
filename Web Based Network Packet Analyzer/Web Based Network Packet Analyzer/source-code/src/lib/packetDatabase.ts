import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import type { CaptureSession, Packet } from "../types";

let sqlJsPromise: Promise<SqlJsStatic> | null = null;
let dbInstance: Database | null = null;

export interface QueryResult {
  columns: string[];
  values: (string | number | null)[][];
  rowCount: number;
  executionTimeMs: number;
}

export interface PredefinedQuery {
  id: string;
  title: string;
  description: string;
  category: "Overview" | "Protocols" | "Security & Flags" | "Forensics";
  sql: string;
}

export const PREDEFINED_QUERIES: PredefinedQuery[] = [
  {
    id: "protocol-distribution",
    title: "Protocol Distribution & Volume",
    description: "Calculates total packet count, byte volume, and average frame size grouped by protocol.",
    category: "Overview",
    sql: `SELECT 
  protocol, 
  COUNT(*) AS packet_count, 
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM packets), 1) || '%' AS percentage,
  SUM(length) AS total_bytes, 
  ROUND(AVG(length), 1) AS avg_packet_size
FROM packets 
GROUP BY protocol 
ORDER BY packet_count DESC;`,
  },
  {
    id: "top-ip-conversations",
    title: "Top Talkers (IP Pairs)",
    description: "Identifies top communicating IP host pairs and data exchanged.",
    category: "Overview",
    sql: `SELECT 
  src_ip, 
  dst_ip, 
  protocol, 
  COUNT(*) AS packet_count, 
  SUM(length) AS total_bytes
FROM packets 
GROUP BY src_ip, dst_ip, protocol 
ORDER BY total_bytes DESC 
LIMIT 15;`,
  },
  {
    id: "tcp-syn-handshakes",
    title: "TCP SYN Handshake Packets",
    description: "Filters TCP packets with SYN flags set (new connection initiation or port scan probing).",
    category: "Security & Flags",
    sql: `SELECT 
  no, 
  rel_time, 
  src_ip, 
  dst_ip, 
  src_port, 
  dst_port, 
  flags, 
  info 
FROM packets 
WHERE protocol = 'TCP' 
  AND flags LIKE '%SYN%'
ORDER BY no ASC;`,
  },
  {
    id: "dns-queries",
    title: "DNS Name Resolutions",
    description: "Queries all DNS query and response records with target domains and query times.",
    category: "Protocols",
    sql: `SELECT 
  no, 
  rel_time, 
  src_ip, 
  dst_ip, 
  src_port, 
  dst_port, 
  info 
FROM packets 
WHERE protocol = 'DNS'
ORDER BY no ASC;`,
  },
  {
    id: "web-traffic",
    title: "Web Traffic (HTTP & HTTPS / TLS)",
    description: "Inspects HTTP, HTTPS, and TLS handshakes and requests across web ports.",
    category: "Protocols",
    sql: `SELECT 
  no, 
  rel_time, 
  src_ip, 
  dst_ip, 
  protocol, 
  length, 
  info 
FROM packets 
WHERE protocol IN ('HTTP', 'HTTPS', 'TLS') 
   OR dst_port IN (80, 443, 8080)
ORDER BY no ASC;`,
  },
  {
    id: "frame-size-distribution",
    title: "Frame Size Bucket Distribution",
    description: "Categorizes packets into small, standard, and jumbo size buckets.",
    category: "Forensics",
    sql: `SELECT 
  CASE 
    WHEN length < 100 THEN 'Small (< 100 bytes)'
    WHEN length BETWEEN 100 AND 500 THEN 'Medium (100 - 500 bytes)'
    WHEN length BETWEEN 501 AND 1400 THEN 'Standard (501 - 1400 bytes)'
    ELSE 'Large / MTU (~1500 bytes)'
  END AS packet_size_tier,
  COUNT(*) AS packet_count,
  SUM(length) AS total_bytes
FROM packets 
GROUP BY packet_size_tier 
ORDER BY total_bytes DESC;`,
  },
  {
    id: "high-bandwidth-packets",
    title: "Large Frame Payloads (> 500 Bytes)",
    description: "Locates high payload frames representing bulk file transfers or HTTP response bodies.",
    category: "Forensics",
    sql: `SELECT 
  no, 
  rel_time, 
  protocol, 
  src_ip, 
  dst_ip, 
  src_port, 
  dst_port, 
  length, 
  info 
FROM packets 
WHERE length > 500 
ORDER BY length DESC 
LIMIT 20;`,
  },
  {
    id: "sessions-overview",
    title: "Saved Capture Sessions Table",
    description: "Examines metadata for saved capture sessions stored in the SQL database.",
    category: "Overview",
    sql: `SELECT 
  id, 
  name, 
  interface_name, 
  filter_used, 
  packet_count, 
  datetime(start_time/1000, 'unixepoch', 'localtime') AS started_at,
  ROUND((end_time - start_time) / 1000.0, 1) || 's' AS duration
FROM sessions 
ORDER BY start_time DESC;`,
  },
];

export async function getSqlJsInstance(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    // Load WASM from public/ — served locally by Vite dev server, inlined in production build
    sqlJsPromise = initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
  }
  return sqlJsPromise;
}

export async function getDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;
  const SQL = await getSqlJsInstance();
  dbInstance = new SQL.Database();
  initializeSchema(dbInstance);
  return dbInstance;
}

function initializeSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS packets (
      id INTEGER PRIMARY KEY,
      no INTEGER,
      timestamp INTEGER,
      rel_time REAL,
      src_mac TEXT,
      dst_mac TEXT,
      src_ip TEXT,
      dst_ip TEXT,
      src_port INTEGER,
      dst_port INTEGER,
      protocol TEXT,
      length INTEGER,
      ttl INTEGER,
      flags TEXT,
      info TEXT,
      payload TEXT,
      payload_hex TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_packets_protocol ON packets(protocol);
    CREATE INDEX IF NOT EXISTS idx_packets_src_ip ON packets(src_ip);
    CREATE INDEX IF NOT EXISTS idx_packets_dst_ip ON packets(dst_ip);
    CREATE INDEX IF NOT EXISTS idx_packets_src_port ON packets(src_port);
    CREATE INDEX IF NOT EXISTS idx_packets_dst_port ON packets(dst_port);
    CREATE INDEX IF NOT EXISTS idx_packets_length ON packets(length);

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT,
      interface_name TEXT,
      filter_used TEXT,
      start_time INTEGER,
      end_time INTEGER,
      packet_count INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Synchronizes packets array with SQLite database in a single fast transaction.
 */
export async function syncPacketsToDatabase(packets: Packet[]): Promise<void> {
  const db = await getDatabase();

  db.run("BEGIN TRANSACTION;");
  try {
    db.run("DELETE FROM packets;");

    const stmt = db.prepare(`
      INSERT INTO packets (
        id, no, timestamp, rel_time, src_mac, dst_mac, src_ip, dst_ip, 
        src_port, dst_port, protocol, length, ttl, flags, info, payload, payload_hex
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `);

    for (const p of packets) {
      stmt.run([
        p.id,
        p.no,
        p.timestamp,
        p.relTime,
        p.srcMac,
        p.dstMac,
        p.srcIp,
        p.dstIp,
        p.srcPort,
        p.dstPort,
        p.protocol,
        p.length,
        p.ttl,
        p.flags.join(", "),
        p.info,
        p.payload,
        p.payloadHex,
      ]);
    }
    stmt.free();

    db.run("COMMIT;");
  } catch (err) {
    db.run("ROLLBACK;");
    throw err;
  }
}

/**
 * Synchronizes session records into SQLite database.
 */
export async function syncSessionsToDatabase(sessions: CaptureSession[]): Promise<void> {
  const db = await getDatabase();

  db.run("BEGIN TRANSACTION;");
  try {
    db.run("DELETE FROM sessions;");

    const stmt = db.prepare(`
      INSERT INTO sessions (
        id, name, interface_name, filter_used, start_time, end_time, packet_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `);

    for (const s of sessions) {
      stmt.run([
        s.id,
        s.name,
        s.interfaceName,
        s.filterUsed,
        s.startTime,
        s.endTime,
        s.packets.length,
      ]);
    }
    stmt.free();

    db.run("COMMIT;");
  } catch (err) {
    db.run("ROLLBACK;");
    throw err;
  }
}

/**
 * Executes a custom SQL query and returns column headers and rows with timing info.
 */
export async function executeQuery(query: string): Promise<QueryResult> {
  const db = await getDatabase();
  const start = performance.now();

  const results = db.exec(query);
  const end = performance.now();
  const executionTimeMs = parseFloat((end - start).toFixed(2));

  if (!results || results.length === 0) {
    return {
      columns: [],
      values: [],
      rowCount: 0,
      executionTimeMs,
    };
  }

  // Return the first result set
  const first = results[0];
  return {
    columns: first.columns,
    values: first.values as (string | number | null)[][],
    rowCount: first.values.length,
    executionTimeMs,
  };
}

/**
 * Exports binary SQLite database as Uint8Array (e.g. for user downloading .sqlite file).
 */
export async function exportDatabaseFile(): Promise<Uint8Array> {
  const db = await getDatabase();
  return db.export();
}

/**
 * Imports an external .sqlite file binary data into the in-memory engine.
 */
export async function importDatabaseFile(data: Uint8Array): Promise<void> {
  const SQL = await getSqlJsInstance();
  if (dbInstance) {
    dbInstance.close();
  }
  dbInstance = new SQL.Database(data);
  initializeSchema(dbInstance);
}

/**
 * Gets total count of rows in the packets table.
 */
export async function getDbPacketCount(): Promise<number> {
  const db = await getDatabase();
  const res = db.exec("SELECT COUNT(*) AS total FROM packets;");
  if (res.length > 0 && res[0].values.length > 0) {
    return Number(res[0].values[0][0]) || 0;
  }
  return 0;
}
