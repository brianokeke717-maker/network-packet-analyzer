import { useEffect, useState } from "react";

export type ConnectionType = "ethernet" | "wifi" | "cellular" | "none" | "unknown";

export interface NetworkStatus {
  isOnline: boolean;
  connectionType: ConnectionType;
}

export function useNetworkStatus(): NetworkStatus {
  const getConnectionType = (): ConnectionType => {
    // Network Information API (Chrome/Edge)
    const conn =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    if (!navigator.onLine) return "none";

    if (conn) {
      // Only use conn.type — it explicitly says "wifi", "ethernet", "cellular", etc.
      // Do NOT use effectiveType ("4g","3g") — that reflects signal quality, not adapter type,
      // and Chrome reports "4g" for WiFi on desktop which would wrongly appear as "cellular".
      const type: string = conn.type || "";
      if (type === "ethernet") return "ethernet";
      if (type === "wifi") return "wifi";
      if (type === "cellular") return "cellular";
    }

    // Browser is online but can't distinguish adapter type (common on Windows desktop).
    return "unknown";
  };

  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: getConnectionType(),
  });

  useEffect(() => {
    const update = () => {
      setStatus({
        isOnline: navigator.onLine,
        connectionType: getConnectionType(),
      });
    };

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    // Also listen to connection changes if API is available
    const conn =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    if (conn) conn.addEventListener("change", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      if (conn) conn.removeEventListener("change", update);
    };
  }, []);

  return status;
}
