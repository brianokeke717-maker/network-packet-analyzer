export type ProtocolType = "TCP" | "UDP" | "ICMP" | "ARP" | "DNS" | "HTTP" | "HTTPS" | "TLS";

export interface Packet {
  id: number;
  no: number;
  timestamp: number; // epoch ms
  relTime: number; // seconds since capture start
  srcMac: string;
  dstMac: string;
  srcIp: string;
  dstIp: string;
  srcPort: number | null;
  dstPort: number | null;
  protocol: ProtocolType;
  length: number;
  ttl: number;
  flags: string[];
  info: string;
  payload: string;
  payloadHex: string;
}

export interface CaptureSession {
  id: string;
  name: string;
  interfaceName: string;
  filterUsed: string;
  startTime: number;
  endTime: number;
  packets: Packet[];
}

export interface NetworkInterface {
  id: string;
  label: string;
  address: string;
  type: "ethernet" | "wifi" | "loopback";
}
