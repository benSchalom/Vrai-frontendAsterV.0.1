import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "../componnents/ui/button"
import { Input } from "../componnents/ui/input"
import { Label } from "../componnents/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../componnents/ui/card"
import { Alert, AlertDescription } from "../componnents/ui/alert"
import { colors } from "../constants/colors"
import { storage } from "../services/storage"
import { proAPI } from "../services/api"
import type { ProRecovery } from "../types/models"
import { AxiosError } from "axios"

export default function RecoveryPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<"email" | "answer">("email")
  const [formData, setFormData] = useState<ProRecovery>({
    email: "",
    secret_answer: "",
    new_device_id: "",
    new_device_name: ""
  })
  const [secretQuestion, setSecretQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [slug, setSlug] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id === "answer" ? "secret_answer" : id]: value,
    }))
  }


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await proAPI.getSecretQuestion(formData.email)

      if (response.data.success) {
        setSecretQuestion(response.data.secret_question)
        setStep("answer")
      }
    } catch (err: unknown) {
      console.error("Erreur lors de l'inscription:", err)
      let msg = "Email introuvable."

      if (err instanceof AxiosError && err.response?.data?.error) {
        msg = err.response.data.error
      } else if (err instanceof Error) {
        msg = err.message
      }

      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const newDeviceId = storage.getOrCreateDeviceId()
      const newDeviceName = storage.getDeviceInfo()

      if (!newDeviceId) {
        setError("Erreur d'initialisation de l'appareil")
        return
      }

      const recoveryData = {
        ...formData,
        new_device_id: newDeviceId,
        new_device_name: newDeviceName
      }

      const response = await proAPI.recovery(recoveryData)

      if (response.data.success) {
        const { pro, access_token, refresh_token } = response.data

        storage.setToken(access_token)
        storage.setRefreshToken(refresh_token)
        storage.setProInfo(pro)

        setSlug(pro.slug)
        setSuccess(true)
      }
    } catch (err: unknown) {
      console.error("Erreur lors de la récupération:", err)
      let msg = "Réponse incorrecte"

      if (err instanceof AxiosError && err.response?.data?.error) {
        msg = err.response.data.error
      } else if (err instanceof Error) {
        msg = err.message
      }

      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    navigate(`/dashboard/${slug}`)
  }

  const handleGoBack = () => {
    if (step === "answer") {
      setStep("email")
      setSecretQuestion("")
      setFormData(prev => ({ ...prev, secret_answer: "" }))
      setError("")
    } else {
      navigate("/")
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: colors.success }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Récupération réussie!</CardTitle>
            <CardDescription>Votre compte a été récupéré sur cet appareil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Vous pouvez maintenant accéder à votre tableau de bord depuis ce nouvel appareil.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleGoToDashboard}
              className="w-full h-12"
              style={{ backgroundColor: colors.primary, color: "white" }}
            >
              Accéder au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" onClick={handleGoBack} className="w-10 h-10 p-0 bg-transparent">
              ←
            </Button>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary + "20" }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: colors.primary }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl">Récupération de compte</CardTitle>
          <CardDescription>
            {step === "email"
              ? "Entrez votre email pour récupérer votre compte"
              : "Répondez à votre question de sécurité"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Adresse email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs mt-2" style={{ color: colors.textLight }}>
                  L'email utilisé lors de votre inscription
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12"
                style={{ backgroundColor: colors.primary, color: "white" }}
              >
                {loading ? "Vérification..." : "Continuer"}
              </Button>
            </form>
          )}

          {step === "answer" && (
            <form onSubmit={handleAnswerSubmit} className="space-y-4">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: colors.primary + "10", border: `1px solid ${colors.primary}` }}
              >
                <p className="text-sm font-medium" style={{ color: colors.text }}>
                  Question de sécurité :
                </p>
                <p className="mt-2" style={{ color: colors.text }}>
                  {secretQuestion}
                </p>
              </div>

              <div>
                <Label htmlFor="answer">Votre réponse *</Label>
                <Input
                  id="answer"
                  type="password"
                  placeholder="Réponse à la question"
                  value={formData.secret_answer}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs mt-2" style={{ color: colors.textLight }}>
                  Entrez la réponse que vous avez définie lors de l'inscription
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12"
                style={{ backgroundColor: colors.primary, color: "white" }}
              >
                {loading ? "Vérification..." : "Récupérer mon compte"}
              </Button>
            </form>
          )}

          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
            <p className="text-xs" style={{ color: colors.textLight }}>
              <strong>Note :</strong> Cette récupération permet de restaurer votre compte sur un nouvel appareil en
              utilisant votre question de sécurité.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
