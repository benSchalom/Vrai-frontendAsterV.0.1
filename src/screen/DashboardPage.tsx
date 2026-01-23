import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../componnents/ui/card"
import { Button } from "../componnents/ui/button"
import { Alert, AlertDescription } from "../componnents/ui/alert"
import QRCodeDisplay from "../componnents/QRCodeDisplay"
import { colors } from "../constants/colors"
import { storage } from "../services/storage"
import { proAPI } from "../services/api"
import type { ProInfo, ProStats } from "../types/models"

export default function DashboardPage() {

  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Informations du professionnel
  const [proInfo, setProInfo] = useState<ProInfo['pro'] | null>(null);
  const [stats, setStats] = useState<ProStats['stats'] | null>(null);

  useEffect(() => {
    loadDashboard()
  }, [slug])

  const loadDashboard = async () => {

    try {

      setLoading(true);
      setError("")

      const cachedPro = storage.getProInfo()

      if (!storage.getToken() || !cachedPro || !slug) {
        setError("Session expirée. Veuillez vous reconnecter.")
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
        return
      }

      setProInfo(cachedPro);
      const cachedProStats = storage.getProStats()
      if (cachedProStats) setStats(cachedProStats)
      setLoading(false);

      // Appel API pour récupérer les infos du pro
      const response = await proAPI.getInfo(cachedPro.slug)
      const data = await response.data
      const responseStats = await proAPI.getStats(cachedPro.slug)
      const dataStats = await responseStats.data

      if (data.success && dataStats.success) {
        setProInfo(data.pro)
        setStats(dataStats.stats)
        storage.setProInfo(data.pro)
        storage.setProStats(dataStats.stats)
      }
    } catch (err) {
      console.error("Erreur synchronisation des données:", err)
      if (!storage.getProInfo()) {
        setError("Le serveur est injoignable et aucune donnée locale n'est disponible.");
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    storage.clearAll()
    navigate("/")
  }

  const handleScanQR = () => {
    const slug = storage.getProInfo()?.slug

    if (slug) {
      navigate(`/dashboard/${slug}/scan`)
    } else {
      navigate("/?error=session_expired")
    }
  }

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: colors.textLight }}>Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  // Affichage erreur
  if (!proInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error || "Erreur de chargement du profil"}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  const brandColor = proInfo.brand_color || colors.primary

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header avec couleur de marque */}
      <div className="border-b" style={{ backgroundColor: brandColor }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm">
                {proInfo.logo_url ? (
                  <img src={proInfo.logo_url} alt={proInfo.business_nom} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold" style={{ color: brandColor }}>
                    {proInfo.business_nom.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{proInfo.business_nom}</h1>
                <p className="text-white text-sm mt-1 opacity-90">Tableau de bord professionnel</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={() => navigate(`/dashboard/${proInfo.slug}/settings`)}
                variant="outline"
                className="flex-1 sm:flex-none bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Paramètres
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex-1 sm:flex-none bg-white text-gray-800 hover:bg-gray-100"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 pt-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "overview" ? "border-b-2 text-blue-600" : "text-gray-600 hover:text-gray-800"
              }`}
            style={activeTab === "overview" ? { borderColor: brandColor, color: brandColor } : {}}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab("qr-code")}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === "qr-code" ? "border-b-2 text-blue-600" : "text-gray-600 hover:text-gray-800"
              }`}
            style={activeTab === "qr-code" ? { borderColor: brandColor, color: brandColor } : {}}
          >
            QR Code
          </button>
        </div>

        {/* Tab: Vue d'ensemble */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Cartes statistiques */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Total Clients */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium" style={{ color: colors.textLight }}>
                      Total Clients
                    </CardTitle>
                    <svg
                      className="w-4 h-4"
                      style={{ color: brandColor }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: colors.text }}>
                    {stats?.total_clients || 0}
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                    Clients inscrits
                  </p>
                </CardContent>
              </Card>

              {/* Récompenses réclamées */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium" style={{ color: colors.textLight }}>
                      Récompenses Réclamées
                    </CardTitle>
                    <svg
                      className="w-4 h-4"
                      style={{ color: colors.success }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: colors.text }}>
                    {stats?.total_rewards_claimed || 0}
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                    Récompenses utilisées
                  </p>
                </CardContent>
              </Card>

              {/* Récompenses disponibles */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium" style={{ color: colors.textLight }}>
                      Récompenses Disponibles
                    </CardTitle>
                    <svg
                      className="w-4 h-4"
                      style={{ color: colors.secondary }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" style={{ color: colors.text }}>
                    {stats?.total_rewards_future || 0}
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                    Prêtes à être réclamées
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Configuration du programme */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration du Programme</CardTitle>
                <CardDescription>Informations sur votre programme de fidélité</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Type de récompense */}
                <div className="flex justify-between items-center p-4 rounded-lg bg-orange-50">
                  <div>
                    <p className="font-medium" style={{ color: colors.text }}>
                      Type de récompense
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.textLight }}>
                      {proInfo.reward_type === "SERVICE OFFERT" ? "Service offert" : "Réduction"}
                    </p>
                  </div>
                  <svg
                    className="w-8 h-8"
                    style={{ color: colors.secondary }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </div>

                {/* Points requis */}
                <div
                  className="flex justify-between items-center p-4 rounded-lg"
                  style={{ backgroundColor: brandColor + "15" }}
                >
                  <div>
                    <p className="font-medium" style={{ color: colors.text }}>
                      Points requis
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.textLight }}>
                      {proInfo.reward_limit} points pour une récompense
                    </p>
                  </div>
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: brandColor }}
                  >
                    {proInfo.reward_limit}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    onClick={handleScanQR}
                    className="w-full text-white h-14"
                    style={{ backgroundColor: brandColor }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Scanner un QR Code
                  </Button>
                  <Button
                    onClick={() => setActiveTab("qr-code")}
                    variant="outline"
                    className="w-full h-14"
                    style={{ borderColor: brandColor, color: brandColor }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                    Voir mon QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: QR Code */}
        {activeTab === "qr-code" && proInfo && (
          <QRCodeDisplay slug={proInfo.slug} businessName={proInfo.business_nom} brandColor={brandColor} />
        )}
      </div>
    </div>
  )
}
