"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Buyer = {
  id: number;
  full_name: string;
  email: string;
  password: string;
  wallet_pubkey: string | null;
  status: string;
  created_at: string;
};

type DetectedCode = {
  rawValue: string;
};

declare global {
  interface Window {
    BarcodeDetector?: new (config: { formats: string[] }) => {
      detect: (video: HTMLVideoElement) => Promise<DetectedCode[]>;
    };
  }
}

export default function Dashboard() {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("buyer");
    if (!stored) {
      router.push("/login");
    } else {
      setBuyer(JSON.parse(stored) as Buyer);
    }
  }, [router]);

  const startScan = async () => {
    try {
      if (!window.BarcodeDetector) {
        alert("Barcode Detector is not supported in this browser.");
        return;
      }

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      setScanning(true);

      const scanLoop = () => {
        if (!scanning) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        detector
          .detect(video)
          .then((codes: DetectedCode[]) => {   // ✅ typed instead of any
            if (codes.length > 0) {
              setQrResult(codes[0].rawValue);
              setScanning(false);
              alert("QR validating...");
              stream.getTracks().forEach((track) => track.stop());
            } else {
              requestAnimationFrame(scanLoop);
            }
          })
          .catch((err: unknown) => console.error(err));   // ✅ typed instead of any
      };

      requestAnimationFrame(scanLoop);
    } catch (err: unknown) {
      console.error("Error starting scan:", err);
    }
  };

  if (!buyer) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {buyer.full_name} 👋</h1>
      <p>Email: {buyer.email}</p>
      <p>Status: {buyer.status}</p>

      <div className="mt-6">
        {!scanning ? (
          <button
            onClick={startScan}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Scan QR Code
          </button>
        ) : (
          <p className="mt-4">Scanning...</p>
        )}
      </div>

      {qrResult && (
        <p className="mt-4 text-blue-600 font-medium">Scanned QR: {qrResult}</p>
      )}
    </div>
  );
}
