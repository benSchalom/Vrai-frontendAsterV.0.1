import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { colors } from "../constants/colors"
import type { ProRegistration } from "../types/models"
import { storage } from "../services/storage"
import { proAPI } from "../services/api"
import axios from "axios"
import { COUNTRIES } from "../constants/countries"
import { compressImage } from "../services/imageUtils"

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const SECRET_QUESTIONS = [
  "Quel est le nom de votre premier animal de compagnie ?",
  "Dans quelle ville êtes-vous né(e) ?",
  "Quel est le nom de jeune fille de votre mère ?",
  "Quel était votre surnom d'enfance ?",
  "Quelle est votre couleur préférée ?",
]

const REWARD_TYPES = [
  { value: "SERVICE OFFERT", label: "Service offert" },
  { value: "REDUCTION", label: "Réduction" },
]


export default function RegistrationFormSimple() {

  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)


  const [error, setError] = useState<string>("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")

  // Nettoyage de l'URL d'objet lors du démontage pour éviter les fuites mémoire
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);
  const [ProRegistration, setProRegistration] = useState<ProRegistration>({
    nom: "",
    business_nom: "",
    email: "",
    device_id: storage.getOrCreateDeviceId(),
    device_name: storage.getDeviceInfo(),
    secret_question: "",
    secret_answer: "",
    reward_type: "SERVICE OFFERT",
    reward_limit: 10,
    brand_color: colors.primary,
    pays: "CA",
  })
  const [countrySearch, setCountrySearch] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 4

  const updateProRegistration = (field: keyof ProRegistration, value: string) => {
    setProRegistration((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1: {
        const hasAllFields = ProRegistration.nom && ProRegistration.business_nom && ProRegistration.email
        const isEmailValid = EMAIL_REGEX.test(ProRegistration.email)
        return hasAllFields && isEmailValid
      }
      case 2:
        return ProRegistration.secret_question && ProRegistration.secret_answer
      case 3:
        return ProRegistration.reward_type && Number(ProRegistration.reward_limit) > 0
      case 4:
        return ProRegistration.brand_color
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !EMAIL_REGEX.test(ProRegistration.email)) {
      setError("Veuillez entrer une adresse email valide (exemple: nom@etablissement.com)")
      return
    }

    if (isStepValid() && currentStep < totalSteps) {
      setError("")
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setError("")
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (!isStepValid()) return

    setIsSubmitting(true)
    setError("")

    try {

      const formData = new FormData()

      formData.append('nom', ProRegistration.nom)
      formData.append('business_nom', ProRegistration.business_nom)
      formData.append('email', ProRegistration.email)
      formData.append('device_id', storage.getOrCreateDeviceId())
      formData.append('device_name', storage.getDeviceInfo())
      formData.append('secret_question', ProRegistration.secret_question)
      formData.append('secret_answer', ProRegistration.secret_answer)
      formData.append('brand_color', ProRegistration.brand_color || colors.primary)

      const rewardLimit = ProRegistration.reward_limit !== undefined ? ProRegistration.reward_limit : 10
      formData.append('reward_limit', rewardLimit.toString())

      formData.append('reward_type', ProRegistration.reward_type || "SERVICE OFFERT")
      formData.append('pays', ProRegistration.pays || "CA")

      if (logoFile) {
        formData.append('logo_url', logoFile)
      }

      const response = await proAPI.register(formData)
      const result = response.data

      if (result.success) {
        //Liberer l'ancien cahe
        storage.clearAll()

        storage.setToken(result.access_token)
        storage.setRefreshToken(result.refresh_token)
        storage.setProInfo(result.pro)

        navigate(`/dashboard/${result.pro.slug}`)
      } else {
        setError(result.message || "Erreur lors de l'inscription")
      }
    } catch (err: unknown) {
      let errorMsg = "Le serveur est injoignable.";

      // On vérifie si c'est une erreur Axios
      if (axios.isAxiosError(err)) {
        // Ici, TypeScript débloque automatiquement l'accès à .response
        errorMsg = err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        // Si c'est une erreur JS classique (ex: crash mémoire)
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle style={{ color: colors.text }}>Inscription Professionnel</CardTitle>
          <CardDescription style={{ color: colors.textLight }}>
            Créez votre compte pour gérer votre programme de fidélité
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex justify-between items-center relative">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex flex-col items-center flex-1 relative z-10">
                  <div
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-colors text-sm sm:text-base"
                    style={{
                      backgroundColor: step <= currentStep ? colors.primary : "#E5E7EB",
                      color: step <= currentStep ? "white" : colors.textLight,
                    }}
                  >
                    {step < currentStep ? "✓" : step}
                  </div>
                  <span
                    className="text-xs mt-2 text-center hidden sm:block"
                    style={{ color: step <= currentStep ? colors.text : colors.textLight }}
                  >
                    {step === 1 && "Informations"}
                    {step === 2 && "Sécurité"}
                    {step === 3 && "Fidélité"}
                    {step === 4 && "Identité"}
                  </span>
                </div>
              ))}

              <div
                className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-gray-200 z-0"
                style={{ marginLeft: "5%", marginRight: "5%", width: "90%" }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    backgroundColor: colors.primary,
                    width: `${((currentStep - 1) / 3) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Step 1: Informations */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: colors.primary }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  Informations de base
                </h3>
              </div>
              <div>
                <Label htmlFor="nom">Nom complet *</Label>
                <Input
                  id="nom"
                  placeholder="Jean Dupont"
                  value={ProRegistration.nom}
                  onChange={(e) => updateProRegistration("nom", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="business_nom">Nom du commerce *</Label>
                <Input
                  id="business_nom"
                  placeholder="Ma Boutique"
                  value={ProRegistration.business_nom}
                  onChange={(e) => updateProRegistration("business_nom", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={ProRegistration.email}
                  onChange={(e) => updateProRegistration("email", e.target.value)}
                />
                {ProRegistration.email && !EMAIL_REGEX.test(ProRegistration.email) && (
                  <p className="text-xs mt-1" style={{ color: colors.error }}>
                    Format d'email invalide
                  </p>
                )}
                {ProRegistration.email && EMAIL_REGEX.test(ProRegistration.email) && (
                  <p className="text-xs mt-1" style={{ color: colors.success }}>
                    ✓ Email valide
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="pays">Pays de votre établissement *</Label>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="🔍 Rechercher un pays..."
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="h-8 text-sm bg-gray-50 border-gray-200"
                  />
                  <select
                    id="pays"
                    value={ProRegistration.pays}
                    onChange={(e) => updateProRegistration("pays", e.target.value)}
                    className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                    style={{ color: colors.text }}
                  >
                    {COUNTRIES.filter(c =>
                      c.label.toLowerCase().includes(countrySearch.toLowerCase()) ||
                      c.code.toLowerCase().includes(countrySearch.toLowerCase())
                    ).map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                    {COUNTRIES.filter(c =>
                      c.label.toLowerCase().includes(countrySearch.toLowerCase())
                    ).length === 0 && (
                        <option disabled>Aucun pays trouvé</option>
                      )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Security question */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: colors.primary }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  Question de sécurité
                </h3>
              </div>
              <div>
                <Label htmlFor="secret_question">Choisissez une question secrète *</Label>
                <select
                  id="secret_question"
                  value={ProRegistration.secret_question}
                  onChange={(e) => updateProRegistration("secret_question", e.target.value)}
                  className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  style={{ color: colors.text }}
                >
                  <option value="">Sélectionnez une question...</option>
                  {SECRET_QUESTIONS.map((question) => (
                    <option key={question} value={question}>
                      {question}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="secret_answer">Réponse secrète *</Label>
                <Input
                  id="secret_answer"
                  type="password"
                  placeholder="Votre réponse secrète"
                  value={ProRegistration.secret_answer}
                  onChange={(e) => updateProRegistration("secret_answer", e.target.value)}
                />
                <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                  Cette réponse vous permettra de récupérer votre compte
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Loyalty configuration */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: colors.primary }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  Configuration du programme de fidélité
                </h3>
              </div>
              <div>
                <Label htmlFor="reward_type">Type de récompense *</Label>
                <div className="space-y-2 mt-2">
                  {REWARD_TYPES.map((reward) => (
                    <label
                      key={reward.value}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                      style={{
                        borderColor: ProRegistration.reward_type === reward.value ? colors.primary : colors.border,
                        backgroundColor:
                          ProRegistration.reward_type === reward.value ? `${colors.primary}10` : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="reward_type"
                        value={reward.value}
                        checked={ProRegistration.reward_type === reward.value}
                        onChange={(e) => updateProRegistration("reward_type", e.target.value)}
                        className="w-4 h-4"
                        style={{ accentColor: colors.primary }}
                      />
                      <span style={{ color: colors.text }}>{reward.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="reward_limit">Limite de points pour récompense *</Label>
                <Input
                  id="reward_limit"
                  type="number"
                  placeholder="10"
                  value={ProRegistration.reward_limit}
                  onChange={(e) => updateProRegistration("reward_limit", e.target.value)}
                />
                <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                  Nombre de points nécessaires pour débloquer une récompense
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Brand color & Logo */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: colors.primary }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                  Identité visuelle
                </h3>
              </div>

              {/* Upload du Logo */}
              <div className="space-y-4 border-b pb-6">
                <Label>Logo de votre établissement</Label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                      <button type='button'
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview("");
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          try {
                            const compressed = await compressImage(file);
                            setLogoFile(compressed)
                            const previewUrl = URL.createObjectURL(compressed);
                            setLogoPreview(previewUrl);
                          } catch {
                            setLogoFile(file);
                            const previewUrl = URL.createObjectURL(file);
                            setLogoPreview(previewUrl);
                          }
                        }
                      }}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                    <p className="text-xs mt-1 text-gray-500">PNG, JPG ou WEBP. Max 2MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="brand_color">Couleur de votre marque *</Label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
                  <input
                    id="brand_color"
                    type="color"
                    value={ProRegistration.brand_color}
                    onChange={(e) => updateProRegistration("brand_color", e.target.value)}
                    className="w-20 h-20 rounded-lg cursor-pointer border-2 border-gray-300"
                  />
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={ProRegistration.brand_color}
                      onChange={(e) => updateProRegistration("brand_color", e.target.value)}
                      placeholder="#3B82F6"
                      className="font-mono"
                    />
                    <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                      Cette couleur apparaîtra sur les cartes de fidélité de vos clients
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: ProRegistration.brand_color }}>
                  <p className="text-white font-semibold text-center">Aperçu de votre couleur</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="w-full sm:w-auto bg-transparent"
            >
              ← Précédent
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                style={{ backgroundColor: colors.primary, color: "white" }}
                className="w-full sm:w-auto"
              >
                Suivant →
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                style={{ backgroundColor: colors.success, color: "white" }}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? "Inscription..." : "S'inscrire ✓"}
              </Button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: colors.border }}>
            <p className="text-sm" style={{ color: colors.textLight }}>
              Vous avez déjà un compte ?{" "}
              <button
                onClick={() => navigate("/recovery")}
                className="font-semibold underline hover:no-underline transition-colors"
                style={{ color: colors.primary }}
                type="button"
              >
                Récupérer mon compte
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
