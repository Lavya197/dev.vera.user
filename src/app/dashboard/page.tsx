"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [buyer, setBuyer] = useState<any>(null);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("buyer");
    if (stored) {
      setBuyer(JSON.parse(stored));
    }
  }, []);

  const startScan = async () => {
    try {
      if (!("BarcodeDetector" in window)) {
        alert("Barcode Detector is not supported in this browser.");
        return;
      }

      const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
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
          .then((codes: any[]) => {
            if (codes.length > 0) {
              setQrResult(codes[0].rawValue);
              setScanning(false);
              alert("QR validating...");
              stream.getTracks().forEach((track) => track.stop());
            } else {
              requestAnimationFrame(scanLoop);
            }
          })
          .catch((err: any) => console.error(err));
      };

      requestAnimationFrame(scanLoop);
    } catch (err) {
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
