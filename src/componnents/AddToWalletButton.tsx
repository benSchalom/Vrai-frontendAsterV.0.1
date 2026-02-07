import { useState } from "react"
import { Button } from "./ui/button"
import { Alert } from "./ui/alert"
import { walletAPI } from "../services/api"

interface AddToWalletButtonProps {
  serialNumber: string
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent)
}

export function AddToWalletButton({ serialNumber }: AddToWalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddToGoogleWallet = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await walletAPI.createPass(serialNumber)

      if (response.success && response.save_url) {
        window.location.href = response.save_url
      } else {
        setError("Erreur lors de la création du pass")
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string }
      setError(axiosErr.response?.data?.error || axiosErr.message || "Une erreur est survenue. Réessayez.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToAppleWallet = async () => {
    setIsLoading(true)
    setError("")

    const result = await walletAPI.downloadApplePass(serialNumber)
    setIsLoading(false)

    if (result.ok) {
      return
    }
    setError(result.error)
  }

  const showApple = isIOS() || !isAndroid()
  const showGoogle = isAndroid() || !isIOS()

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {showApple && (
          <Button
            onClick={handleAddToAppleWallet}
            disabled={isLoading}
            variant="default"
            className="w-full sm:w-auto bg-black text-white hover:bg-gray-800"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Chargement...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Ajouter à Apple Wallet
              </span>
            )}
          </Button>
        )}

        {showGoogle && (
          <Button
            onClick={handleAddToGoogleWallet}
            disabled={isLoading}
            variant="default"
            className="w-full sm:w-auto bg-black text-white hover:bg-gray-800"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Chargement...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
                Ajouter à Google Wallet
              </span>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        {isIOS() && "Sur iPhone : ajoutez la carte à Apple Wallet. "}
        {isAndroid() && "Sur Android (et Samsung) : la carte sera ajoutée à Google Wallet. "}
        {!isIOS() && !isAndroid() && "Sur iPhone : Apple Wallet. Sur Android : Google Wallet. "}
        La carte sera accessible hors ligne.
      </p>
    </div>
  )
}
