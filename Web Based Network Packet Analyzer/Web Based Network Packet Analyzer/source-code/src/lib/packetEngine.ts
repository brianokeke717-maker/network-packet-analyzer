import type { Packet, ProtocolType, NetworkInterface } from "../types";

export const INTERFACES: NetworkInterface[] = [
  { id: "wlan0", label: "wlan0 — Wi-Fi Adapter (Connected)", address: "192.168.1.5", type: "wifi" },
  { id: "eth0", label: "eth0 — Ethernet Adapter (Disconnected / No Cable)", address: "No carrier", type: "ethernet" },
  { id: "lo", label: "lo — Loopback Interface", address: "127.0.0.1", type: "loopback" },
  { id: "any", label: "any — All Active Interfaces", address: "0.0.0.0", type: "ethernet" },
];

interface Host {
  ip: string;
  mac: string;
  name: string;
}

const LOCAL_HOSTS: Host[] = [
  { ip: "192.168.1.5", mac: "d8:3a:dd:1a:2b:3c", name: "My-PC" },
  { ip: "192.168.1.1", mac: "00:1a:2b:3c:4d:5e", name: "Gateway" },
  { ip: "192.168.1.10", mac: "3c:5a:b4:11:22:33", name: "Laptop-02" },
  { ip: "192.168.1.15", mac: "f0:9f:c2:44:55:66", name: "Smart-TV" },
  { ip: "192.168.1.20", mac: "a4:5e:60:77:88:99", name: "Mobile-Device" },
];

const REMOTE_HOSTS: Host[] = [
  { ip: "142.250.183.206", mac: "52:54:00:aa:01:01", name: "google.com" },
  { ip: "157.240.22.35", mac: "52:54:00:aa:02:02", name: "facebook.com" },
  { ip: "104.16.132.229", mac: "52:54:00:aa:03:03", name: "cloudflare-cdn.com" },
  { ip: "13.107.21.200", mac: "52:54:00:aa:04:04", name: "microsoft.com" },
  { ip: "151.101.65.69", mac: "52:54:00:aa:05:05", name: "fastly-cdn.net" },
  { ip: "172.217.169.46", mac: "52:54:00:aa:06:06", name: "youtube.com" },
  { ip: "140.82.113.3", mac: "52:54:00:aa:07:07", name: "github.com" },
  { ip: "8.8.8.8", mac: "52:54:00:aa:08:08", name: "dns.google" },
];

const DOMAINS = [
  "www.google.com",
  "api.github.com",
  "www.facebook.com",
  "cdn.cloudflare.com",
  "login.microsoftonline.com",
  "www.youtube.com",
  "fonts.gstatic.com",
  "www.wikipedia.org",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randHex(bytes: number) {
  let s = "";
  for (let i = 0; i < bytes; i++) {
    s += Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0") + " ";
  }
  return s.trim();
}

function randomLocalHost(): Host {
  return pick(LOCAL_HOSTS);
}

function randomRemoteHost(): Host {
  return pick(REMOTE_HOSTS);
}

let idCounter = 1;

const PROTO_POOL: ProtocolType[] = [
  "TCP",
  "TCP",
  "TCP",
  "UDP",
  "DNS",
  "DNS",
  "HTTP",
  "HTTPS",
  "HTTPS",
  "ICMP",
  "ARP",
];

export function resetPacketCounter() {
  idCounter = 1;
}

export function generatePacket(captureStart: number): Packet {
  const proto = pick(PROTO_POOL);
  const now = Date.now();
  const local = randomLocalHost();
  const remote = randomRemoteHost();
  const outbound = Math.random() > 0.4;

  let srcIp = outbound ? local.ip : remote.ip;
  let dstIp = outbound ? remote.ip : local.ip;
  let srcMac = outbound ? local.mac : remote.mac;
  let dstMac = outbound ? remote.mac : local.mac;
  let srcPort: number | null = null;
  let dstPort: number | null = null;
  let protocol: ProtocolType = "TCP";
  let length = 64;
  let flags: string[] = [];
  let info = "";
  const ttl = outbound ? randInt(60, 64) : randInt(48, 56);

  switch (proto) {
    case "ARP": {
      protocol = "ARP";
      const who = pick(LOCAL_HOSTS);
      const target = pick(LOCAL_HOSTS.filter((h) => h.ip !== who.ip));
      length = randInt(42, 60);
      srcIp = who.ip;
      dstIp = target.ip;
      srcMac = who.mac;
      dstMac = "ff:ff:ff:ff:ff:ff";
      const isReply = Math.random() > 0.5;
      info = isReply
        ? `${who.ip} is at ${who.mac}`
        : `Who has ${target.ip}? Tell ${who.ip}`;
      break;
    }
    case "ICMP": {
      protocol = "ICMP";
      length = randInt(74, 98);
      const isReply = Math.random() > 0.5;
      const seq = randInt(1, 64);
      info = isReply
        ? `Echo (ping) reply  id=0x${randInt(4096, 65000).toString(16)}, seq=${seq}/${(seq * 256) % 65536}, ttl=${ttl}`
        : `Echo (ping) request  id=0x${randInt(4096, 65000).toString(16)}, seq=${seq}/${(seq * 256) % 65536}, ttl=${ttl}`;
      break;
    }
    case "DNS": {
      protocol = "DNS";
      srcPort = outbound ? randInt(49152, 65535) : 53;
      dstPort = outbound ? 53 : randInt(49152, 65535);
      length = randInt(60, 130);
      const domain = pick(DOMAINS);
      const txid = randInt(0, 65535).toString(16).padStart(4, "0");
      const isResponse = !outbound;
      info = isResponse
        ? `Standard query response 0x${txid} A ${domain} A ${remote.ip}`
        : `Standard query 0x${txid} A ${domain}`;
      break;
    }
    case "UDP": {
      protocol = "UDP";
      srcPort = outbound ? randInt(49152, 65535) : randInt(1024, 65535);
      dstPort = outbound ? randInt(1024, 65535) : randInt(49152, 65535);
      length = randInt(60, 220);
      info = `${srcPort} → ${dstPort} Len=${length - 42}`;
      break;
    }
    case "HTTP": {
      protocol = "HTTP";
      srcPort = outbound ? randInt(49152, 65535) : 80;
      dstPort = outbound ? 80 : randInt(49152, 65535);
      length = randInt(200, 1480);
      flags = ["PSH", "ACK"];
      info = outbound
        ? `GET /${pick(["index.html", "api/data", "assets/app.js", "images/logo.png"])} HTTP/1.1`
        : `HTTP/1.1 ${pick(["200 OK", "304 Not Modified", "404 Not Found"])}`;
      break;
    }
    case "HTTPS": {
      protocol = "HTTPS";
      srcPort = outbound ? randInt(49152, 65535) : 443;
      dstPort = outbound ? 443 : randInt(49152, 65535);
      length = randInt(60, 1480);
      flags = [pick(["PSH, ACK", "ACK", "SYN", "SYN, ACK", "FIN, ACK"])];
      info = pick([
        "Client Hello",
        "Server Hello",
        "Application Data",
        "Change Cipher Spec",
        `${srcPort} → ${dstPort} [ACK] Seq=1 Ack=1 Win=64240 Len=0`,
      ]);
      break;
    }
    default: {
      protocol = "TCP";
      srcPort = outbound ? randInt(49152, 65535) : randInt(1, 65000);
      dstPort = outbound ? randInt(1, 65000) : randInt(49152, 65535);
      length = randInt(54, 1500);
      const flagSet = pick([
        ["SYN"],
        ["SYN", "ACK"],
        ["ACK"],
        ["PSH", "ACK"],
        ["FIN", "ACK"],
        ["RST"],
      ]);
      flags = flagSet;
      info = `${srcPort} → ${dstPort} [${flagSet.join(", ")}] Seq=${randInt(0, 5000)} Ack=${randInt(0, 5000)} Win=64240 Len=${Math.max(0, length - 54)}`;
    }
  }

  const payloadBytes = Math.max(0, length - 54);
  const previewBytes = Math.min(16, payloadBytes);

  const packet: Packet = {
    id: idCounter++,
    no: idCounter - 1,
    timestamp: now,
    relTime: (now - captureStart) / 1000,
    srcMac,
    dstMac,
    srcIp,
    dstIp,
    srcPort,
    dstPort,
    protocol,
    length,
    ttl,
    flags,
    info,
    payload: info,
    payloadHex: randHex(previewBytes),
  };

  return packet;
}

export function hostLabel(ip: string): string {
  const match = [...LOCAL_HOSTS, ...REMOTE_HOSTS].find((h) => h.ip === ip);
  return match ? match.name : ip;
}

// --------------------- Filtering ---------------------

export function matchesFilter(packet: Packet, rawFilter: string): boolean {
  const filter = rawFilter.trim().toLowerCase();
  if (!filter) return true;

  const tokens = filter
    .split(/\s+and\s+|\s*&&\s*/i)
    .map((t) => t.trim())
    .filter(Boolean);

  return tokens.every((token) => matchesToken(packet, token));
}

function matchesToken(packet: Packet, token: string): boolean {
  const protoNames = ["tcp", "udp", "icmp", "arp", "dns", "http", "https"];
  if (protoNames.includes(token)) {
    return packet.protocol.toLowerCase() === token;
  }
  if (token.startsWith("port ")) {
    const port = Number(token.replace("port ", "").trim());
    return packet.srcPort === port || packet.dstPort === port;
  }
  if (token.startsWith("host ")) {
    const host = token.replace("host ", "").trim();
    return packet.srcIp.includes(host) || packet.dstIp.includes(host);
  }
  if (token.startsWith("src ")) {
    const host = token.replace("src ", "").trim();
    return packet.srcIp.includes(host);
  }
  if (token.startsWith("dst ")) {
    const host = token.replace("dst ", "").trim();
    return packet.dstIp.includes(host);
  }
  // fallback: free-text search
  const haystack = `${packet.srcIp} ${packet.dstIp} ${packet.protocol} ${packet.info} ${packet.srcPort ?? ""} ${packet.dstPort ?? ""}`.toLowerCase();
  return haystack.includes(token);
}

// --------------------- Export: CSV ---------------------

export function exportCsv(packets: Packet[], filename = "capture.csv") {
  const header = ["No", "Time", "Source", "Destination", "Protocol", "Length", "Src Port", "Dst Port", "Info"];
  const rows = packets.map((p) => [
    p.no,
    new Date(p.timestamp).toISOString(),
    p.srcIp,
    p.dstIp,
    p.protocol,
    p.length,
    p.srcPort ?? "",
    p.dstPort ?? "",
    `"${p.info.replace(/"/g, '""')}"`,
  ]);
  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv" }), filename);
}

// --------------------- Export: PCAP (binary) ---------------------

function ipToBytes(ip: string): number[] {
  return ip.split(".").map((n) => Number(n) & 0xff);
}

function macToBytes(mac: string): number[] {
  return mac.split(":").map((h) => parseInt(h, 16));
}

function ipChecksum(bytes: number[]): number {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 2) {
    sum += (bytes[i] << 8) + (bytes[i + 1] ?? 0);
  }
  while (sum >> 16) {
    sum = (sum & 0xffff) + (sum >> 16);
  }
  return ~sum & 0xffff;
}

function buildPacketBytes(p: Packet): number[] {
  const srcMac = macToBytes(p.srcMac);
  const dstMac = macToBytes(p.dstMac);

  if (p.protocol === "ARP") {
    const ethertype = [0x08, 0x06];
    const arp = [
      0x00, 0x01, // hardware type Ethernet
      0x08, 0x00, // protocol type IPv4
      0x06, // hw addr len
      0x04, // proto addr len
      0x00, 0x01, // opcode request
      ...srcMac,
      ...ipToBytes(p.srcIp),
      ...dstMac.map(() => 0x00),
      ...ipToBytes(p.dstIp),
    ];
    return [...dstMac, ...srcMac, ...ethertype, ...arp];
  }

  const payloadLen = Math.max(0, p.length - 54);
  const payload = new Array(payloadLen).fill(0x41);

  let protoNum = 6; // TCP
  if (p.protocol === "UDP" || p.protocol === "DNS") protoNum = 17;
  if (p.protocol === "ICMP") protoNum = 1;

  let transportHeader: number[] = [];
  if (protoNum === 1) {
    // ICMP: type(1) code(1) checksum(2) id(2) seq(2)
    transportHeader = [8, 0, 0, 0, 0, 1, 0, 1, ...payload.slice(0, Math.max(0, payload.length))];
  } else if (protoNum === 17) {
    const srcPort = p.srcPort ?? 0;
    const dstPort = p.dstPort ?? 0;
    const udpLen = 8 + payload.length;
    transportHeader = [
      (srcPort >> 8) & 0xff,
      srcPort & 0xff,
      (dstPort >> 8) & 0xff,
      dstPort & 0xff,
      (udpLen >> 8) & 0xff,
      udpLen & 0xff,
      0,
      0,
      ...payload,
    ];
  } else {
    const srcPort = p.srcPort ?? 0;
    const dstPort = p.dstPort ?? 0;
    let flagsByte = 0;
    if (p.flags.some((f) => f.includes("SYN"))) flagsByte |= 0x02;
    if (p.flags.some((f) => f.includes("ACK"))) flagsByte |= 0x10;
    if (p.flags.some((f) => f.includes("FIN"))) flagsByte |= 0x01;
    if (p.flags.some((f) => f.includes("RST"))) flagsByte |= 0x04;
    if (p.flags.some((f) => f.includes("PSH"))) flagsByte |= 0x08;
    transportHeader = [
      (srcPort >> 8) & 0xff,
      srcPort & 0xff,
      (dstPort >> 8) & 0xff,
      dstPort & 0xff,
      0, 0, 0, 1, // seq
      0, 0, 0, 0, // ack
      0x50, // data offset
      flagsByte,
      0xff, 0xff, // window
      0, 0, // checksum
      0, 0, // urgent ptr
      ...payload,
    ];
  }

  const totalLen = 20 + transportHeader.length;
  const ipHeaderNoChecksum = [
    0x45,
    0x00,
    (totalLen >> 8) & 0xff,
    totalLen & 0xff,
    0x00,
    0x00,
    0x40,
    0x00,
    p.ttl,
    protoNum,
    0x00,
    0x00,
    ...ipToBytes(p.srcIp),
    ...ipToBytes(p.dstIp),
  ];
  const checksum = ipChecksum(ipHeaderNoChecksum);
  const ipHeader = [...ipHeaderNoChecksum];
  ipHeader[10] = (checksum >> 8) & 0xff;
  ipHeader[11] = checksum & 0xff;

  const ethertype = [0x08, 0x00];
  return [...dstMac, ...srcMac, ...ethertype, ...ipHeader, ...transportHeader];
}

export function exportPcap(packets: Packet[], filename = "capture.pcap") {
  const globalHeader = new Uint8Array(24);
  const gv = new DataView(globalHeader.buffer);
  gv.setUint32(0, 0xa1b2c3d4, true);
  gv.setUint16(4, 2, true);
  gv.setUint16(6, 4, true);
  gv.setInt32(8, 0, true);
  gv.setUint32(12, 0, true);
  gv.setUint32(16, 65535, true);
  gv.setUint32(20, 1, true); // LINKTYPE_ETHERNET

  const chunks: Uint8Array[] = [globalHeader];

  packets.forEach((p) => {
    const bytes = buildPacketBytes(p);
    const recHeader = new Uint8Array(16);
    const rv = new DataView(recHeader.buffer);
    const sec = Math.floor(p.timestamp / 1000);
    const usec = (p.timestamp % 1000) * 1000;
    rv.setUint32(0, sec, true);
    rv.setUint32(4, usec, true);
    rv.setUint32(8, bytes.length, true);
    rv.setUint32(12, bytes.length, true);
    chunks.push(recHeader, new Uint8Array(bytes));
  });

  downloadBlob(new Blob(chunks as BlobPart[], { type: "application/vnd.tcpdump.pcap" }), filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
