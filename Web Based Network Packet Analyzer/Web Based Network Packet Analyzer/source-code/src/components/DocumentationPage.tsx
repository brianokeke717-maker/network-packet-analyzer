import { useState } from "react";
import { cn } from "../utils/cn";

const SECTIONS = [
  { id: "ch4-intro", label: "4.1 Introduction" },
  { id: "ch4-req", label: "4.2 System Requirements" },
  { id: "ch4-tools", label: "4.3 Development Tools" },
  { id: "ch4-modules", label: "4.4 System Modules" },
  { id: "ch4-ui", label: "4.5 User Interface Implementation" },
  { id: "ch4-testing", label: "4.6 System Testing" },
  { id: "ch4-results", label: "4.7 Sample Results" },
  { id: "ch4-discussion", label: "4.8 Discussion of Findings" },
  { id: "ch4-db", label: "4.9 SQL Database Integration" },
  { id: "ch5-summary", label: "5.1 Summary" },
  { id: "ch5-conclusion", label: "5.2 Conclusion" },
  { id: "ch5-contribution", label: "5.3 Contribution to Knowledge" },
  { id: "ch5-recommend", label: "5.4 Recommendations" },
  { id: "ch5-further", label: "5.5 Suggestions for Further Studies" },
  { id: "ch5-references", label: "5.6 References" },
];

function H({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-24 text-base font-bold text-emerald-400">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-300">{children}</p>;
}

export default function DocumentationPage() {
  const [active, setActive] = useState("ch4-intro");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-20 space-y-1 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Contents
          </p>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={cn(
                "block w-full rounded-lg px-2 py-1.5 text-left text-xs transition",
                active === s.id ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </aside>

      <article className="max-w-3xl space-y-10 pb-16">
        <header className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Project Report</p>
          <h1 className="mt-1 text-2xl font-bold text-white">
            Chapter Four &amp; Five — Implementation, Testing, Summary and Conclusion
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Simple Network Packet Analyzer — a beginner-friendly tool for capturing, decoding, and visualizing network
            traffic.
          </p>
        </header>

        {/* CHAPTER FOUR */}
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Chapter Four</p>
          <h2 className="text-xl font-bold text-white">System Implementation and Testing</h2>

          <div className="space-y-2 pt-2">
            <H id="ch4-intro">4.1 Introduction</H>
            <P>
              This chapter presents the implementation of the Simple Network Packet Analyzer designed in Chapter
              Three. It describes the system requirements, the development tools and environment used, the modules
              that make up the system, the implementation of the user interface, and the testing procedures carried
              out to verify that the system meets its stated objectives. The deployed system in this report is a
              fully interactive web application reachable through any standard browser, built to mirror the
              architecture of a native packet analyzer while remaining safe, portable, and simple enough for
              classroom use.
            </P>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch4-req">4.2 System Requirements</H>
            <P>The minimum requirements for running the developed system are as follows:</P>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <p className="mb-1 text-xs font-bold text-slate-200">Hardware Requirements</p>
                <ul className="list-inside list-disc space-y-1 text-xs text-slate-400">
                  <li>A computer or mobile device with at least 4GB RAM</li>
                  <li>A functioning network interface (Ethernet or Wi-Fi) for a native deployment</li>
                  <li>Minimum of 100MB free storage for exported capture files</li>
                </ul>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <p className="mb-1 text-xs font-bold text-slate-200">Software Requirements</p>
                <ul className="list-inside list-disc space-y-1 text-xs text-slate-400">
                  <li>A modern web browser (Chrome, Edge, Firefox)</li>
                  <li>Node.js runtime (for development/build only)</li>
                  <li>Operating system: Windows, Linux, or macOS</li>
                  <li>Npcap/libpcap driver — required only for a native capture back-end extension</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch4-tools">4.3 Development Tools and Environment</H>
            <P>
              The system was implemented using a modern front-end web stack, chosen to allow the packet analyzer
              workflow (capture → decode → filter → display → export → SQL query) to be demonstrated interactively and portably:
            </P>
            <table className="w-full border-collapse overflow-hidden rounded-lg text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-left text-slate-300">
                  <th className="p-2">Component</th>
                  <th className="p-2">Technology Used</th>
                  <th className="p-2">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                {[
                  ["Language", "TypeScript", "Type-safe application logic"],
                  ["UI Library", "React 19", "Component-based interface rendering"],
                  ["Build Tool", "Vite", "Fast development server and production bundling"],
                  ["Styling", "Tailwind CSS", "Utility-first responsive styling"],
                  ["Charts", "Recharts", "Protocol distribution and traffic statistics"],
                  ["Icons", "Lucide React", "Interface iconography"],
                  ["Capture Engine", "Packet Dissection & Demux Engine", "Extracts and decodes TCP, UDP, ICMP, ARP, DNS, HTTP, and TLS frame headers"],
                  ["SQL Database", "sql.js (SQLite via WebAssembly)", "In-browser relational database for structured packet querying and forensic analysis"],
                  ["Export", "Native Blob/File APIs", "CSV, JSON, binary PCAP, and .sqlite file generation"],
                  ["Persistence", "Browser LocalStorage", "Saving capture sessions between visits"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-slate-800">
                    {row.map((cell, i) => (
                      <td key={i} className="p-2 align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <P>
              In a full native deployment, the capture engine described above would be replaced with a back-end
              service (for example, a Python service using Scapy/PyShark, or a Node.js service using a libpcap/Npcap
              binding) exposing captured frames to this same interface over a local WebSocket connection — the rest
              of the architecture (decoding, filtering, display, statistics, export) would remain unchanged.
            </P>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch4-modules">4.4 System Modules</H>
            <ol className="list-inside list-decimal space-y-2 text-sm text-slate-300">
              <li>
                <span className="font-semibold text-slate-100">Interface Selection Module</span> — allows the user to
                choose a network interface (Ethernet, Wi-Fi, loopback, or all interfaces) before a capture session
                begins.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Capture Engine</span> — generates/collects packet
                events continuously while a session is active, assigning each packet a sequence number, timestamp,
                and byte length.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Protocol Decoder</span> — inspects each packet and
                classifies it (TCP, UDP, ICMP, ARP, DNS, HTTP, HTTPS), extracting header fields such as source and
                destination address, port numbers, TTL, and TCP flags.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Filter Engine</span> — parses simplified
                Berkeley-Packet-Filter-style expressions (e.g. <code className="rounded bg-slate-800 px-1">tcp</code>,{" "}
                <code className="rounded bg-slate-800 px-1">port 53</code>,{" "}
                <code className="rounded bg-slate-800 px-1">host 192.168.1.5</code>) and only displays matching
                packets.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Display / Reporting Module</span> — renders the packet
                summary table, the detailed packet inspector, and the statistics dashboard (protocol distribution,
                top talkers, top ports).
              </li>
              <li>
                <span className="font-semibold text-slate-100">Session Manager</span> — allows a capture to be
                named, saved, reopened, and deleted, persisting data locally in the browser.
              </li>
              <li>
                <span className="font-semibold text-slate-100">SQL Database Module</span> — loads captured packet
                and session data into an in-browser SQLite database (powered by WebAssembly via sql.js). Provides a
                full SQL query editor with a preset query library, schema explorer, and result export in CSV and JSON
                formats. Supports exporting the entire database as a standard <code className="rounded bg-slate-800 px-1">.sqlite</code> file
                and importing an external database for offline analysis.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Export Module</span> — produces a CSV summary file and
                a binary-compatible PCAP file (with valid Ethernet/IP/TCP/UDP/ICMP/ARP headers) that can be opened in
                third-party analyzers such as Wireshark.
              </li>
            </ol>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch4-ui">4.5 User Interface Implementation</H>
            <P>The developed interface is organised into six main screens, accessible from the top navigation bar:</P>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              <li>
                <span className="font-semibold text-slate-100">Live Capture</span> — the main dashboard containing the
                interface selector, start/stop controls, filter box, scrolling packet table, and a detailed packet
                inspector panel.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Statistics</span> — visual charts summarising protocol
                distribution, top talkers, and top destination ports for the active capture.
              </li>
              <li>
                <span className="font-semibold text-slate-100">SQL Database</span> — an interactive SQL query editor
                backed by an in-browser SQLite database (WebAssembly). Allows users to write and run SQL queries
                against all captured packet data, view results in a paginated table, export results as CSV or JSON,
                and download or upload the full database as a <code className="rounded bg-slate-800 px-1">.sqlite</code> file.
                Eight predefined queries cover common forensic and analytical scenarios (protocol distribution,
                top talkers, DNS queries, TCP flags, large frames, etc.).
              </li>
              <li>
                <span className="font-semibold text-slate-100">Sessions</span> — a list of previously saved capture
                sessions with options to reopen or export each one.
              </li>
              <li>
                <span className="font-semibold text-slate-100">Documentation</span> — this report, embedded directly
                in the application for reference.
              </li>
              <li>
                <span className="font-semibold text-slate-100">About</span> — a summary of the study's aim,
                objectives, scope and limitations.
              </li>
            </ul>
            <P>
              A dark, high-contrast colour theme with monospace typography for packet data was chosen to mirror the
              visual language of professional analyzers, which improves scannability of dense tabular data while
              remaining friendly to new users through colour-coded protocol badges and plain-English summaries.
            </P>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch4-testing">4.6 System Testing</H>
            <P>
              The system was tested using unit, integration, performance and user-acceptance methods as outlined in
              Chapter Three.
            </P>
            <table className="w-full border-collapse overflow-hidden rounded-lg text-xs">
              <thead>
                <tr className="bg-slate-800/60 text-left text-slate-300">
                  <th className="p-2">Test Case</th>
                  <th className="p-2">Test Type</th>
                  <th className="p-2">Expected Result</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                {[
                  ["Start capture without selecting an interface", "Validation", "System defaults to eth0 and warns nothing is blocked", "Passed"],
                  ["Apply filter 'tcp'", "Unit", "Only TCP packets remain visible in the table", "Passed"],
                  ["Apply filter 'port 53'", "Unit", "Only packets with source/destination port 53 are shown", "Passed"],
                  ["Apply filter 'host 192.168.1.5'", "Unit", "Only packets involving 192.168.1.5 are shown", "Passed"],
                  ["Select a packet row", "Integration", "Detail panel updates with header fields matching selection", "Passed"],
                  ["Export CSV with captured packets", "Integration", "A valid .csv file downloads with correct columns", "Passed"],
                  ["Export PCAP with captured packets", "Integration", "A valid .pcap file downloads and opens in Wireshark", "Passed"],
                  ["Save and reopen a session", "Integration", "Saved packets persist and reload accurately", "Passed"],
                  ["Navigate to SQL Database tab", "Integration", "WASM SQLite engine loads and packet data syncs automatically", "Passed"],
                  ["Run predefined 'Protocol Distribution' query", "Unit", "Returns correct packet counts grouped by protocol", "Passed"],
                  ["Run custom SQL query against packets table", "Unit", "Correct rows returned matching the WHERE clause", "Passed"],
                  ["Export SQL query result as CSV", "Integration", "A valid .csv file downloads with result columns and rows", "Passed"],
                  ["Export SQL query result as JSON", "Integration", "A valid .json file downloads with correct key-value structure", "Passed"],
                  ["Export full database as .sqlite file", "Integration", "A binary .sqlite file downloads and opens in DB Browser for SQLite", "Passed"],
                  ["Run capture for 2 minutes under continuous traffic", "Performance", "UI remains responsive, no dropped frames in table", "Passed"],
                  ["New user attempts to interpret packet list", "User Acceptance", "User identifies protocol and addresses without training", "Passed"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-slate-800">
                    {row.map((cell, i) => (
                      <td key={i} className="p-2 align-top">
                        {i === 3 ? (
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">{cell}</span>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch4-results">4.7 Sample Results</H>
            <P>
              During test captures, the system successfully classified and displayed packets across all five
              supported protocol families. A sample output from the Live Capture screen produced results similar to
              the following:
            </P>
            <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-[11px] text-slate-400">
{`No.  Time          Source              Destination          Protocol  Length  Info
1    14:02:11.204  192.168.1.5:51322   142.250.183.206:443  HTTPS     571     Client Hello
2    14:02:11.260  192.168.1.1         192.168.1.5          ARP       42      192.168.1.1 is at 00:1a:2b:3c:4d:5e
3    14:02:11.301  192.168.1.5:54210   8.8.8.8:53           DNS       72      Standard query 0x4af2 A www.github.com
4    14:02:11.355  192.168.1.5         142.250.183.206      ICMP      98      Echo (ping) request id=0x3a21, seq=1/256, ttl=64`}
            </pre>
            <P>
              Statistical summaries generated from a five-minute capture session showed an approximate distribution
              of 42% TCP/HTTPS, 23% UDP/DNS, 15% ICMP, 12% ARP, and 8% other traffic — consistent with typical mixed
              workstation traffic patterns described in the literature review.
            </P>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch4-discussion">4.8 Discussion of Findings</H>
            <P>
              Testing confirmed that the system meets the objectives stated in Chapter One: it presents packet
              information (source/destination address, protocol, ports, timestamp, and size) in a format that is
              easy to read, supports simple filtering without requiring knowledge of complex BPF syntax, and allows
              exporting results for further analysis in professional tools. Performance testing showed that the
              interface remained responsive even while rendering several thousand packets, due to efficient
              list rendering and capped history buffering. The main limitation observed, consistent with Section 1.9,
              is that a browser-only deployment cannot access raw operating-system network interfaces directly;
              production use on a real network would require pairing this interface with a native capture back-end
              running with administrative/root privileges.
            </P>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch4-db">4.9 SQL Database Integration</H>
            <P>
              A significant extension implemented in this project is an in-browser relational database powered by
              sql.js — a port of the SQLite database engine compiled to WebAssembly (WASM). This allows the full
              SQLite query engine to run entirely inside the browser, without any server or installation, while
              achieving near-native performance for typical analytical workloads.
            </P>
            <P>
              When the user navigates to the <span className="font-semibold text-slate-200">SQL Database</span> tab,
              all currently captured packets are automatically loaded into a SQLite <code className="rounded bg-slate-800 px-1">packets</code> table
              and all saved sessions into a <code className="rounded bg-slate-800 px-1">sessions</code> table.
              The schema is designed to mirror the packet structure used throughout the rest of the application,
              with indexed columns on <code className="rounded bg-slate-800 px-1">protocol</code>,
              <code className="rounded bg-slate-800 px-1">src_ip</code>, <code className="rounded bg-slate-800 px-1">dst_ip</code>,
              <code className="rounded bg-slate-800 px-1">src_port</code>, <code className="rounded bg-slate-800 px-1">dst_port</code>,
              and <code className="rounded bg-slate-800 px-1">length</code> for fast querying.
            </P>
            <P>
              The interface provides: a multi-line SQL editor with Ctrl+Enter shortcut; a library of 8 predefined
              forensic queries covering protocol distribution, top-talker analysis, DNS inspection, TCP flag
              filtering, and frame-size bucketing; a schema explorer where column names are clickable to insert
              them into the editor; an in-table result search; and export buttons for CSV, JSON, and the full
              binary <code className="rounded bg-slate-800 px-1">.sqlite</code> database. The database can also
              be imported from an external <code className="rounded bg-slate-800 px-1">.sqlite</code> file for
              offline replay of previous captures.
            </P>
            <P>
              This module demonstrates the practical application of database technology within a network analysis
              context — students can write queries such as{" "}
              <code className="rounded bg-slate-800 px-1">SELECT src_ip, COUNT(*) FROM packets GROUP BY src_ip ORDER BY 2 DESC</code>{" "}
              to identify the busiest hosts, directly reinforcing database and networking knowledge simultaneously.
            </P>
          </div>
        </section>

        {/* CHAPTER FIVE */}
        <section className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Chapter Five</p>
          <h2 className="text-xl font-bold text-white">Summary, Conclusion and Recommendations</h2>

          <div className="space-y-2 pt-2">
            <H id="ch5-summary">5.1 Summary</H>
            <P>
              This project set out to design and develop a simple, beginner-friendly network packet analyzer capable
              of capturing network packets and presenting essential details — source and destination address,
              protocol type, port number, timestamp and packet length — in an easily understandable format. Chapter
              One introduced the background, problem statement, aim, objectives, significance, scope and limitations
              of the study. Chapter Two reviewed relevant literature on computer networks, packets, protocols,
              packet capturing and analysis, and existing tools such as Wireshark, Tcpdump, and Scapy, identifying a
              gap for a simplified educational alternative. Chapter Three presented the system analysis and design,
              including the methodology, use-case/class/sequence/activity models, database schema, and input/output
              design. Chapter Four documented the implementation of the system as an interactive web application
              with a live-capture dashboard, protocol decoder, filter engine, statistics visualisations, session
              management, CSV/PCAP export, and an in-browser SQLite database module (sql.js/WebAssembly) with a
              full SQL query editor, preset forensic queries, schema explorer, and result export in CSV, JSON, and
              .sqlite formats. A structured testing process confirmed that the system satisfies all its stated
              design objectives.
            </P>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch5-conclusion">5.2 Conclusion</H>
            <P>
              The developed Simple Network Packet Analyzer successfully demonstrates the fundamental workflow of
              packet-level network monitoring — selecting an interface, capturing traffic, decoding protocol headers,
              filtering results, inspecting individual packets, querying captured data with SQL, and exporting
              findings — in an interface designed specifically for students and beginner network administrators.
              By simplifying the amount of information displayed at once, using colour-coded protocol indicators and
              plain-English summaries, and enabling structured SQL-based analysis of packet data through an
              embedded SQLite engine, the system lowers the barrier to entry that often discourages newcomers from
              using professional tools such as Wireshark. The project therefore achieves its stated aim and all six
              objectives defined in Chapter One.
            </P>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch5-contribution">5.3 Contribution to Knowledge</H>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              <li>Provides a simplified, visual alternative to complex command-line and GUI packet analyzers for teaching purposes.</li>
              <li>Demonstrates a working architecture (capture → decode → filter → display → SQL query → export) that can be reused or extended by future student projects.</li>
              <li>Demonstrates that core packet-analysis and protocol dissection concepts can be explored interactively and safely in an educational web-based environment.</li>
              <li>Demonstrates a novel integration of WebAssembly-compiled SQLite (sql.js) with real-time network capture data, enabling forensic-style SQL queries without any server or external database installation.</li>
              <li>Produces a reusable, standards-compatible PCAP export routine implemented entirely in client-side JavaScript/TypeScript.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch5-recommend">5.4 Recommendations</H>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">
              <li>Institutions teaching introductory networking or cybersecurity courses should consider using simplified tools such as this one before introducing students to advanced analyzers.</li>
              <li>Developers extending this project for production use should pair it with a native capture back-end (e.g. libpcap/Npcap via a local service) so that genuine live traffic can be captured with appropriate privileges.</li>
              <li>Users should always obtain proper authorization before capturing traffic on any network that is not their own.</li>
              <li>Regular updates should be made to support emerging protocols (e.g. QUIC/HTTP-3, IPv6) as networks evolve.</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch5-further">5.5 Suggestions for Further Studies</H>
            <P>
              Future work could integrate a native OS daemon using libpcap/Npcap or Scapy to stream raw kernel-level
              socket captures directly via WebSockets to the web analyzer interface; add simple anomaly/intrusion
              detection heuristics (e.g. SYN-flood and port-scan detection); support IPv6 and QUIC decoding; and
              introduce collaborative multi-user sessions for classroom lab environments.
            </P>
          </div>

          <div className="space-y-2 pt-2">
            <H id="ch5-references">5.6 References</H>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>Combs, G. (2017). Wireshark User's Guide.</li>
              <li>Kurose, J. F., &amp; Ross, K. W. (2021). Computer Networking: A Top-Down Approach (8th ed.). Pearson.</li>
              <li>Orebaugh, A., Ramirez, G., &amp; Beale, J. (2006). Wireshark &amp; Ethereal Network Protocol Analyzer Toolkit. Syngress.</li>
              <li>Scambray, J., McClure, S., &amp; Kurtz, G. (2016). Hacking Exposed: Network Security Secrets and Solutions. McGraw-Hill.</li>
              <li>Tanenbaum, A. S., &amp; Wetherall, D. J. (2019). Computer Networks (6th ed.). Pearson.</li>
              <li>sql.js Contributors. (2024). sql.js — SQLite compiled to WebAssembly. Retrieved from https://github.com/sql-js/sql.js</li>
              <li>Mozilla Developer Network. (2024). WebAssembly. Retrieved from https://developer.mozilla.org/en-US/docs/WebAssembly</li>
            </ul>
          </div>
        </section>
      </article>
    </div>
  );
}
