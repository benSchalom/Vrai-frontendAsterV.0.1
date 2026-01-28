import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode"
import { Button } from "./ui/button"
import { Alert } from "./ui/alert"
import { colors } from "../constants/colors"
import type { ScanResult } from "../types/models"
import { storage } from "../services/storage"
import type { CarteScan } from "../types/models"
import { carteAPI } from "../services/api"


interface QRScannerProps {
  slug: string
}


export default function QRScanner({ slug }: QRScannerProps) {
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string>("")
  const [isSuccessFlash, setIsSuccessFlash] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  // Nettoyage lors de la fermeture de la page
  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  const startScanning = async () => {

    try {
      setError("")
      setScanResult(null)
      setIsScanning(true)

      // On attend que le DOM soit mis à jour pour trouver la div "reader"
      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
            videoConstraints: {
              facingMode: "environment" // Force la caméra arrière
            }
          },
          /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;
      }, 100);
    } catch (err: any) {
      console.log("[v0] Camera access error:", err)
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.")
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Erreur arrêt scanner:", err);
      }
    }
    setIsScanning(false)
  }

  const onScanSuccess = async (decodedText: string) => {
    // On arrête tout dès qu'on a un résultat pour éviter les doubles scans
    await stopScanning();
    handleScan(decodedText);
  }

  const onScanFailure = (_error: any) => {
    // On ignore les échecs de lecture continue
  }

  const handleScan = async (qrData: string) => {
    stopScanning()

    try {
      const serialFromUrl = qrData.split('/').pop() || qrData;
      // Récupérer pro_id depuis localStorage
      const proInfo = storage.getProInfo()

      if (!proInfo || !proInfo.slug) {
        setError("Session expirée. Reconnectez-vous.");
        return;
      }

      // Feedback Haptique (Vibration)
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }

      // Feedback Visuel (Flash)
      setIsSuccessFlash(true);
      setTimeout(() => setIsSuccessFlash(false), 1000);

      const scanData: CarteScan = {
        serial_number: serialFromUrl,
        slug: proInfo.slug,
        device_id: storage.getOrCreateDeviceId()
      };

      const response = await carteAPI.scan(scanData);
      const data = await response.data

      if (data.success) {
        setScanResult(data)
      } else {
        setError(data.message || "Erreur lors du scan")
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Impossible de joindre le serveur.";
      setError(errorMessage);
    }
  }

  const handleGoBack = () => {
    navigate(`/dashboard/${slug}`)
  }

  const handleScanAnother = () => {
    setScanResult(null)
    setError("")
    startScanning()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="border-b" style={{ backgroundColor: colors.primary, borderColor: colors.border }}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={handleGoBack} className="text-white hover:bg-white/10">
            ← Retour
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Scanner une carte de fidélité
            </h2>
            <p className="text-sm text-gray-600 mt-1">Positionnez le QR code de la carte devant la caméra</p>
          </div>

          <div className="p-6 space-y-6">
            {!scanResult && !error && (
              <div className="space-y-4">

                {/* ZONE DE VIDEO */}
                <div
                  className={`relative aspect-square bg-black rounded-lg overflow-hidden border-4 transition-colors duration-300 ${isSuccessFlash ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]" : "border-transparent"
                    }`}
                >
                  {isScanning ? (
                    <div id="reader" className="w-full h-full"></div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                      <div className="text-6xl mb-4">📷</div>
                      <p className="text-center text-sm">Prêt pour le scan</p>
                    </div>
                  )}
                </div>

                {!isScanning ? (
                  <Button
                    onClick={startScanning}
                    className="w-full h-12 text-white font-medium"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Activer la caméra
                  </Button>
                ) : (
                  <Button onClick={stopScanning} variant="outline" className="w-full h-12 bg-transparent">
                    Arrêter le scan
                  </Button>
                )}

                <div className="p-4 rounded-lg" style={{ backgroundColor: colors.primary + "10" }}>
                  <p className="text-sm" style={{ color: colors.textLight }}>
                    <strong>Astuce :</strong> Assurez-vous que le QR code est bien éclairé et à plat devant la caméra.
                  </p>
                </div>
              </div>
            )}

            {scanResult && scanResult.success && (
              <div className="space-y-4">
                <Alert variant="default" className="bg-green-50 border-green-200">
                  ✓ {scanResult.message}
                </Alert>

                <div
                  className="p-6 rounded-lg border-2"
                  style={{ borderColor: colors.success, backgroundColor: colors.success + "10" }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: colors.success }}
                    >
                      🎁
                    </div>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                        {scanResult.client_name}
                      </h3>
                      <p className="text-sm" style={{ color: colors.textLight }}>
                        Client fidèle
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span style={{ color: colors.textLight }}>Points actuels</span>
                      <span className="font-bold text-xl" style={{ color: colors.text }}>
                        {scanResult.points_count} / {scanResult.reward_limit}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${(scanResult.points_count / scanResult.reward_limit) * 100}%`,
                          backgroundColor: colors.success,
                        }}
                      />
                    </div>

                    {scanResult.reward_available && (
                      <div
                        className="p-4 rounded-lg mt-4 flex items-center gap-3"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        <span className="text-2xl">✨</span>
                        <div className="text-white">
                          <p className="font-bold">Récompense disponible!</p>
                          <p className="text-sm text-white/90">
                            {scanResult.reward_used
                              ? "Récompense utilisée lors de ce scan"
                              : "Le client peut réclamer sa récompense"}
                          </p>
                        </div>
                      </div>
                    )}

                    {(scanResult.total_rewards ?? 0) > 0 && (
                      <p className="text-sm text-center pt-2" style={{ color: colors.textLight }}>
                        Total de récompenses réclamées: {scanResult.total_rewards}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleScanAnother}
                  className="w-full h-12 text-white font-medium"
                  style={{ backgroundColor: colors.primary }}
                >
                  📷 Scanner une autre carte
                </Button>
              </div>
            )}

            {error && (
              <div className="space-y-4">
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  ✗ {error}
                </Alert>

                <Button onClick={handleScanAnother} variant="outline" className="w-full h-12 bg-transparent">
                  📷 Réessayer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
