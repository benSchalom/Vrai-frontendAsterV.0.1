import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "../componnents/ui/button"
import { Input } from "../componnents/ui/input"
import { Label } from "../componnents/ui/label"
import { Alert } from "../componnents/ui/alert"
import { colors } from "../constants/colors"
import { clientAPI, proAPI } from "../services/api"
import type { ClientEnrollment, ProInfo } from "../types/models"
import { storage } from "../services/storage"
import { AddToWalletButton } from "../componnents/AddToWalletButton"

export default function EnrollmentPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [proInfo, setProInfo] = useState<ProInfo['pro'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<ClientEnrollment>({
    nom: "",
    telephone: "",
    device_id: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serialNumber, setSerialNumber] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (slug) {
      loadProInfo(slug)
    }
    const id = storage.getOrCreateDeviceId();
    setFormData(prev => ({ ...prev, device_id: id }));
  }, [slug])

  const loadProInfo = async (proSlug: string) => {
    try {
      const response = await proAPI.getInfo(proSlug)
      const data = response.data

      if (data.success) {
        setProInfo(data.pro)
      } else {
        setError("Commerce introuvable")
      }
    } catch (err: unknown) {

      // Pour accéder aux propriétés spécifiques d'Axios sans utiliser 'any'
      const axiosError = err as {
        message: string;
        config?: { url: string };
        response?: { data: { error?: string }; status: number }
      };

      console.error("DEBUG RÉSEAU:", axiosError.message, axiosError.config?.url);

      const msg = axiosError.response?.data?.error || axiosError.message || "Une erreur est survenue.";
      setError(msg);

    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nom || !formData.telephone) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await clientAPI.enroll(slug as string, formData)

      const data = await response.data

      if (data.success) {
        setSerialNumber(data.info.serial_number)
        setMessage(data.info.message)
        setSuccess(true)
      } else {
        setError("Erreur lors de l'inscription")
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error("Erreur lors de l'inscription:", error.message)
      const msg = error.message || "Une erreur est survenue. Réessayez."
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-mono break-all w-full max-w-sm">
            <strong>Log erreur :</strong> {error}
          </div>
        )}
      </div>
    )
  }

  if (!proInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md w-full">
          <Alert variant="destructive"> Ce commerce n'existe pas </Alert>
        </div>
      </div>
    )
  }

  const brandColor = proInfo.brand_color || colors.primary

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
          <div className="p-6">
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: colors.success }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
              <p className="text-gray-600">Votre carte de fidélité a été créée</p>
            </div>

            <div
              className="p-4 rounded-lg text-center mb-6 border-2"
              style={{ backgroundColor: brandColor + "10", borderColor: brandColor }}
            >
              <p className="text-sm mb-2 text-gray-600">Votre numéro de carte</p>
              <p className="text-2xl font-bold font-mono" style={{ color: brandColor }}>
                {serialNumber}
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5"
                  style={{ color: brandColor }}
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
                <div>
                  <p className="font-medium text-gray-900">Gagnez des points à chaque visite</p>
                  <p className="text-sm text-gray-600">Faites scanner votre carte à chaque achat</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 mt-0.5"
                  style={{ color: brandColor }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">{proInfo.reward_limit} points = 1 récompense</p>
                  <p className="text-sm text-gray-600">Débloquez votre récompense en accumulant des points</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => navigate(`/carte/${serialNumber}`)}
                className="w-full text-white h-12"
                style={{ backgroundColor: brandColor }}
              >
                Voir ma carte de fidélité
              </Button>

              <AddToWalletButton serialNumber={serialNumber} />
            </div>

            <p className="text-xs text-center mt-4 text-gray-500">
              Ajoutez cette page à votre écran d'accueil pour un accès rapide
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-md w-full">
        <div className="p-6">
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{proInfo.business_nom}</h2>
            <p className="text-gray-600">Rejoignez notre programme de fidélité</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reward Info Banner */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: brandColor + "10" }}>
              <div className="flex items-center gap-3">
                <svg
                  className="w-8 h-8"
                  style={{ color: brandColor }}
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
                <div>
                  <p className="font-semibold text-gray-900">{proInfo.reward_limit} achats = 1 récompense</p>
                  <p className="text-sm text-gray-600">
                    {proInfo.reward_type === "SERVICE OFFERT" && "Service offert"}
                    {proInfo.reward_type === "REDUCTION" && "Réduction"}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <Label htmlFor="nom">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Nom complet *
                </span>
              </Label>
              <Input
                id="nom"
                placeholder="Jean Dupont"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="telephone">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Téléphone *
                </span>
              </Label>
              <Input
                id="telephone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
              />
            </div>

            {error && <Alert variant="destructive"> {error} </Alert>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white h-12"
              style={{ backgroundColor: brandColor }}
            >
              {isSubmitting ? "Inscription..." : "S'inscrire gratuitement"}
            </Button>

            <p className="text-xs text-center text-gray-500">
              En vous inscrivant, vous acceptez de recevoir des notifications sur votre programme de fidélité
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
