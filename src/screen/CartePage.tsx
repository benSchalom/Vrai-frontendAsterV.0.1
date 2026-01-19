import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import { Card, CardContent, CardHeader } from "../componnents/ui/card"
import { Button } from "../componnents/ui/button"
import { colors } from "../constants/colors"
import type { CarteInfo } from "../types/models"
import { carteAPI } from "../services/api"
import { AddToWalletButton } from "../componnents/AddToWalletButton"


export default function CartePage() {
  const { serial } = useParams<{ serial: string }>()
  const [carteInfo, setCarteInfo] = useState<CarteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (serial) {
      loadCarteInfo(serial)

      // Mise en place du rafraîchissement automatique toutes les 10 secondes
      const interval = setInterval(() => {
        loadCarteInfo(serial, true) // 'true' pour un rafraîchissement silencieux
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [serial])

  const loadCarteInfo = async (serial: string, silent = false) => {
    try {
      if (!silent) setLoading(true)
      const response = await carteAPI.getInfo(serial)
      const data = response.data

      if (data.success) {
        setCarteInfo(data)
      } else {
        setError("Carte introuvable")
      }
    } catch (err) {
      console.error("Erreur chargement carte:", err)
      setError("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    loadCarteInfo(serial as string)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement de votre carte...</p>
        </div>
      </div>
    )
  }

  if (error || !carteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">{error || "Erreur de chargement"}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { carte, client, pro } = carteInfo
  const pointsPercentage = (carte.points / carte.reward_limit) * 100
  const remainingPoints = carte.reward_limit - carte.points

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec couleur du pro */}
      <div className="border-b" style={{ backgroundColor: pro.brand_color || colors.primary }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{pro.business_name}</h1>
                <p className="text-white/80 text-sm">{client.full_name}</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
              disabled={loading}
            >
              <svg
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Bannière récompense disponible */}
        {carte.reward_available && (
          <div className="p-6 rounded-xl border-2 bg-orange-500 border-orange-500 animate-pulse">
            <div className="flex items-center gap-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Récompense disponible!</h2>
                <p className="text-white/90 text-sm mt-1">
                  Présentez cette carte au commerçant pour réclamer votre récompense
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Carte de fidélité */}
        <Card className="overflow-hidden">
          <div
            className="h-32 relative"
            style={{
              background: `linear-gradient(135deg, ${pro.brand_color || colors.primary} 0%, ${pro.brand_color || colors.primary}dd 100%)`,
            }}
          >
            <div className="absolute inset-0 flex items-center justify-between px-6">
              <div>
                <p className="text-white/80 text-sm">Carte de fidélité</p>
                <p className="text-white font-bold text-lg mt-1">{pro.business_name}</p>
              </div>
              <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
          </div>

          <CardContent className="pt-6 space-y-6">
            {/* Progression des points */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm text-gray-600">Progression</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {carte.points} / {carte.reward_limit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Points restants</p>
                  <p className="text-2xl font-bold text-orange-500">{remainingPoints}</p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                  style={{
                    width: `${pointsPercentage}%`,
                    backgroundColor: carte.reward_available ? colors.secondary : pro.brand_color || colors.primary,
                  }}
                />
              </div>

              <p className="text-sm mt-2 text-center text-gray-600">
                {carte.reward_available
                  ? "Félicitations! Vous avez atteint l'objectif"
                  : `Plus que ${remainingPoints} point${remainingPoints > 1 ? "s" : ""} pour votre récompense`}
              </p>
            </div>

            {/* Visualisation des points */}
            <div>
              <p className="text-sm font-medium mb-3 text-gray-900">Vos points</p>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: carte.reward_limit }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg flex items-center justify-center border-2 transition-all"
                    style={{
                      backgroundColor: index < carte.points ? pro.brand_color || colors.primary : "transparent",
                      borderColor: index < carte.points ? pro.brand_color || colors.primary : colors.border,
                    }}
                  >
                    {index < carte.points && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm text-gray-600">Récompenses réclamées</p>
                <p className="text-2xl font-bold mt-1 text-gray-900">{carte.total_rewards}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Membre depuis</p>
                <p className="text-sm font-medium mt-1 text-gray-900">
                  {new Date(carte.created_at).toLocaleDateString("fr-FR", {
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte QR Code */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">QR Code de la carte</h3>
                <p className="text-sm text-gray-600">Faites scanner ce code à chaque achat</p>
              </div>
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: pro.brand_color || colors.primary }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </button>
            </div>
          </CardHeader>

          {showQR ? (
            <CardContent>
              <QRCodeCard serial={serial!} brandColor={pro.brand_color || colors.primary} />
            </CardContent>
          ) : (
            <CardContent>
              <Button
                onClick={() => setShowQR(true)}
                className="w-full h-12"
                style={{ backgroundColor: pro.brand_color || colors.primary }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                Afficher le QR Code
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Bouton Google Wallet */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Ajouter à votre wallet</h3>
            <p className="text-sm text-gray-600">Gardez votre carte de fidélité toujours accessible</p>
          </CardHeader>
          <CardContent>
            <AddToWalletButton serialNumber={carteInfo.carte.serial_number} />
          </CardContent>
        </Card>

        {/* Info PWA */}
        <div className="p-4 rounded-lg bg-blue-50">
          <p className="text-sm text-center text-gray-600">
            Ajoutez cette page à votre écran d'accueil pour y accéder rapidement
          </p>
        </div>
      </div>
    </div>
  )
}

function QRCodeCard({ serial, brandColor }: { serial: string; brandColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateQRCode()
  }, [serial])

  const generateQRCode = async () => {
    if (!canvasRef.current) return

    try {
      const QRCode = (await import("qrcode"))
      const qrValue = `${window.location.origin}/carte/${serial}`
      await QRCode.toCanvas(canvasRef.current, qrValue, {
        width: 250,
        margin: 2,
        color: {
          dark: brandColor,
          light: "#FFFFFF",
        },
      })
    } catch (error) {
      console.error("Erreur génération QR:", error)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="p-4 bg-white rounded-xl border-2" style={{ borderColor: brandColor }}>
        <canvas ref={canvasRef} />
      </div>
      <div className="text-center">
        <p className="text-sm font-mono text-gray-600">{serial}</p>
      </div>
    </div>
  )
}
