# SimpleSniff — Simple Network Packet Analyzer

> An educational, browser-based network packet analyzer built as a final-year computer science project.

---

## 📌 Project Overview

**SimpleSniff** is a web application that simulates the core workflow of a professional network packet analyzer (such as Wireshark) in a beginner-friendly, browser-only environment. Because browsers cannot access raw network interfaces directly, the system uses a realistic traffic-simulation engine to generate authentic TCP, UDP, ICMP, ARP, DNS, HTTP, HTTPS, and TLS packet flows — allowing students to explore the full capture → filter → inspect → query → export pipeline safely, without any installation or elevated privileges.

A key feature of this project is an **in-browser SQLite database** (powered by WebAssembly via [sql.js](https://github.com/sql-js/sql.js)) that allows captured packet data to be queried using standard SQL — bridging networking and database concepts in a single tool.

---

## 🎯 Objectives

1. Design the architecture and user interface of the packet analyzer.
2. Develop a system that can simulate and capture packets from a selected network interface.
3. Extract and display important packet information — source/destination address, protocol type, port number, timestamp, and packet size.
4. Provide a simple and understandable output for students and beginner network administrators.
5. Integrate an in-browser SQL database for structured querying and forensic analysis of captured network data.
6. Test and evaluate the performance and accuracy of the developed system.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Live Capture** | Simulates real TCP, UDP, ICMP, ARP, DNS, HTTP, HTTPS, and TLS traffic in real time |
| **Packet Inspector** | Deep-dive into any packet — headers, flags, TTL, payload, and hex dump |
| **BPF-style Filter** | Filter packets with expressions like `tcp`, `port 443`, `host 8.8.8.8` |
| **Statistics Dashboard** | Recharts-powered pie charts for protocol distribution, top talkers, and top ports |
| **SQL Database** | Full in-browser SQLite query editor with 8 preset forensic queries and schema explorer |
| **Session Manager** | Save, name, reload, and delete capture sessions (persisted in localStorage) |
| **CSV Export** | Export visible packets as a spreadsheet-compatible CSV file |
| **PCAP Export** | Export captures as a binary `.pcap` file openable in Wireshark |
| **SQLite Export** | Export the entire database as a `.sqlite` file for offline analysis |
| **SQL Result Export** | Export any query result as CSV or JSON |
| **Embedded Documentation** | Full Chapter 4 & 5 project report built into the application |

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| TypeScript | 5.9 | Type-safe application logic |
| React | 19 | Component-based UI rendering |
| Vite | 7 | Development server and production bundling |
| Tailwind CSS | 4 | Utility-first responsive styling |
| Recharts | 3 | Protocol and traffic statistics charts |
| sql.js | latest | SQLite database engine compiled to WebAssembly |
| Lucide React | latest | Interface iconography |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone or extract the project
cd network-packet-analysis-introduction

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173** (or the next available port).

### Production Build

```bash
npm run build
```

The build output is in the `dist/` folder. Thanks to `vite-plugin-singlefile`, the entire application is bundled into a **single self-contained `index.html`** file that works offline without a server.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AboutPage.tsx         # Aim, objectives, scope, limitations
│   ├── ControlPanel.tsx      # Capture controls and filter input
│   ├── DocumentationPage.tsx # Embedded Chapter 4 & 5 report
│   ├── Navbar.tsx            # Top navigation bar
│   ├── PacketDetails.tsx     # Packet header/payload inspector
│   ├── PacketTable.tsx       # Scrolling packet list
│   ├── ProtocolBadge.tsx     # Colour-coded protocol labels
│   ├── SessionsPage.tsx      # Saved session management
│   ├── SqlDatabasePage.tsx   # SQLite query editor UI
│   └── StatisticsPage.tsx    # Recharts statistics dashboard
├── lib/
│   ├── packetDatabase.ts     # SQLite engine (sql.js WASM)
│   └── packetEngine.ts       # Packet simulation and export engine
├── utils/
│   └── cn.ts                 # Tailwind class utility
├── types.ts                  # Shared TypeScript interfaces
├── App.tsx                   # Root component and app state
└── main.tsx                  # Entry point
public/
└── sql-wasm.wasm             # SQLite WebAssembly binary
```

---

## 🗄️ SQL Database

The **SQL Database** tab provides a full interactive SQL environment backed by SQLite (via WebAssembly):

### Available Tables

**`packets`** — all captured network frames
```sql
SELECT protocol, COUNT(*) AS total, SUM(length) AS bytes
FROM packets
GROUP BY protocol
ORDER BY total DESC;
```

**`sessions`** — saved capture session metadata
```sql
SELECT name, packet_count, datetime(start_time/1000, 'unixepoch', 'localtime') AS started
FROM sessions
ORDER BY start_time DESC;
```

### Preset Query Library
| Query | Category |
|-------|----------|
| Protocol Distribution & Volume | Overview |
| Top Talkers (IP Pairs) | Overview |
| Saved Capture Sessions Table | Overview |
| DNS Name Resolutions | Protocols |
| Web Traffic (HTTP & HTTPS / TLS) | Protocols |
| TCP SYN Handshake Packets | Security & Flags |
| Frame Size Bucket Distribution | Forensics |
| Large Frame Payloads (> 500 Bytes) | Forensics |

---

## 📄 License

This project is developed as an academic final-year project. All rights reserved by the author.

---

## 👥 Project Authors & Supervisions

- **Researchers**:
  - **Okeke Daniel Ifeanyichukwu** (Reg No: `2022/249772`)
  - **Okeke Brian Ezenwa** (Reg No: `2022/249947`)
- **Supervisor**: **Dr. U.K. Umeh**
- **Head of Department**: **Prof. C.H. Ugwuishiwu**
- **Department**: Department of Computer Science
- **Institution**: **University of Nigeria, Nsukka**
- **Year**: July, 2026

---

## 🙏 Acknowledgements

- Project Supervisor: **Dr. U.K. Umeh**
- Head of Department: **Prof. C.H. Ugwuishiwu**
- Department of Computer Science, University of Nigeria, Nsukka
- [Wireshark](https://www.wireshark.org/) — reference for UI design patterns
- [sql.js](https://github.com/sql-js/sql.js) — SQLite compiled to WebAssembly
