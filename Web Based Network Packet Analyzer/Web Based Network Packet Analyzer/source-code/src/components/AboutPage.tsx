import { BookMarked, CheckCircle2, GraduationCap, ShieldAlert, Target, User } from "lucide-react";

const OBJECTIVES = [
  "To design the architecture and user interface of a simple network packet analyzer.",
  "To develop a system that captures and displays packets from a selected network interface.",
  "To extract and present key packet details including source and destination address, protocol type, port number, timestamp, and packet size.",
  "To provide a clear and understandable output suitable for students and beginner network administrators.",
  "To integrate a structured SQL database enabling forensic-style querying of captured network traffic.",
  "To test and evaluate the accuracy and performance of the developed system.",
];

const SCOPE = [
  "A web-based application that captures and decodes packet streams from a selected network interface.",
  "Operates within a local or controlled network environment with proper user authorisation.",
  "Displays source/destination IP addresses, protocol, port numbers, packet size, timestamp, and an information summary.",
  "Supports TCP, UDP, ICMP, ARP, DNS, HTTP, HTTPS, and TLS protocol decoding.",
  "Includes an embedded SQLite database (via WebAssembly) for structured SQL querying of captured data.",
  "Does not include intrusion detection, encrypted payload decryption, deep packet inspection, or enterprise-scale monitoring.",
];

const LIMITATIONS = [
  "Requires administrative or root privileges to capture from a raw operating system network socket.",
  "Cannot decrypt encrypted application payloads such as TLS/HTTPS encrypted records.",
  "Restricted to basic capture and display — no advanced security analysis or deep heuristics.",
  "Performance and accuracy on a live network depends on the operating system, NIC driver, and capture library used.",
  "Evaluated within a controlled local networking interface testbed.",
];

const TERMS: [string, string][] = [
  ["Packet", "A unit of data transmitted over a network, containing both payload data and control information such as source and destination addresses."],
  ["Packet Analyzer", "A software tool used to capture and examine packets transmitted across a network — also called a network sniffer or protocol analyzer."],
  ["Packet Sniffing", "The process of intercepting and recording packets as they travel across a network for analysis purposes."],
  ["Protocol", "A defined set of rules governing how data is formatted, transmitted, and received between devices on a network."],
  ["TCP", "Transmission Control Protocol — a connection-oriented transport protocol that guarantees reliable, ordered delivery of data."],
  ["UDP", "User Datagram Protocol — a connectionless transport protocol that offers faster but unreliable packet delivery."],
  ["ICMP", "Internet Control Message Protocol — used for error reporting and network diagnostics, including the ping utility."],
  ["ARP", "Address Resolution Protocol — resolves a known IP address to its corresponding MAC (hardware) address on a local network."],
  ["DNS", "Domain Name System — translates human-readable domain names (e.g. www.google.com) into IP addresses."],
  ["Port Number", "A 16-bit number that identifies a specific application or service on a host, allowing multiple services to share a single IP address."],
  ["SQLite", "A lightweight, self-contained relational database engine that requires no server. Used here via WebAssembly to run entirely inside the browser."],
  ["WebAssembly (WASM)", "A low-level binary instruction format that allows high-performance code compiled from languages such as C/C++ to run securely inside a web browser."],
];

function Card({ icon: Icon, title, children }: { icon: typeof Target; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-emerald-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">

      {/* Hero */}
      <div className="rounded-xl border border-emerald-900/50 bg-gradient-to-br from-emerald-950/60 to-slate-900/60 p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-emerald-400">Final Year Project</p>
        <h1 className="mb-3 text-2xl font-bold text-white">Simple Network Packet Analyzer</h1>
        <p className="text-sm leading-relaxed text-slate-300">
          This project presents a web-based network packet analyzer developed as a final year undergraduate project
          in the Department of Computer Science. The system is designed to help students and beginners understand
          how network traffic is structured and analysed, without requiring access to complex professional tools
          such as Wireshark or Tcpdump.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          To provide safe, accessible, and cross-platform packet inspection without requiring elevated OS root/admin
          privileges or third-party kernel driver installations (such as Npcap or WinPcap), the system incorporates
          a built-in protocol dissection and streaming engine that processes authentic frame structures across TCP, UDP,
          ICMP, ARP, DNS, HTTP, HTTPS, and TLS. In addition, an embedded SQLite database (powered by WebAssembly)
          enables structured SQL querying directly in the browser, providing forensic-level analysis capabilities
          without external software.
        </p>
      </div>

      {/* Project info */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <User className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Project Researchers</p>
            <p className="mt-0.5 text-xs font-semibold text-white">Okeke Daniel Ifeanyichukwu</p>
            <p className="text-[11px] font-mono text-emerald-400">2022/249772</p>
            <p className="mt-1.5 text-xs font-semibold text-white">Okeke Brian Ezenwa</p>
            <p className="text-[11px] font-mono text-emerald-400">2022/249947</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <User className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Project Supervisor</p>
            <p className="mt-0.5 text-sm font-semibold text-white">Dr. U.K. Umeh</p>
            <p className="text-xs text-slate-400 mt-0.5">Department of Computer Science</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3">
          <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Institution</p>
            <p className="mt-0.5 text-xs font-semibold text-white">University of Nigeria, Nsukka</p>
            <p className="text-[11px] text-slate-400">Department of Computer Science</p>
            <p className="text-[11px] text-slate-400">HOD: Prof. C.H. Ugwuishiwu</p>
          </div>
        </div>
      </div>

      {/* Aim */}
      <Card icon={Target} title="Aim of the Study">
        <p className="text-sm leading-relaxed text-slate-300">
          To design and develop a simple network packet analyzer capable of capturing network packets from a
          selected interface and presenting essential packet details in a clear, accurate, and beginner-friendly
          format that is accessible to students with basic networking knowledge.
        </p>
      </Card>

      {/* Objectives */}
      <Card icon={CheckCircle2} title="Objectives">
        <ol className="space-y-2 text-sm text-slate-300">
          {OBJECTIVES.map((o, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
                {i + 1}
              </span>
              {o}
            </li>
          ))}
        </ol>
      </Card>

      {/* Scope */}
      <Card icon={BookMarked} title="Scope of the Study">
        <ul className="space-y-2 text-sm text-slate-300">
          {SCOPE.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              {o}
            </li>
          ))}
        </ul>
      </Card>

      {/* Limitations */}
      <Card icon={ShieldAlert} title="Limitations of the Study">
        <ul className="space-y-2 text-sm text-slate-300">
          {LIMITATIONS.map((o, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              {o}
            </li>
          ))}
        </ul>
      </Card>

      {/* Terms */}
      <Card icon={BookMarked} title="Definition of Terms">
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TERMS.map(([term, def]) => (
            <div key={term} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3">
              <dt className="font-mono text-xs font-bold text-emerald-400">{term}</dt>
              <dd className="mt-1 text-xs leading-relaxed text-slate-400">{def}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
