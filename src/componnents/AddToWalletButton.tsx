import { useState } from "react"
import { Button } from "./ui/button"
import { Alert } from "./ui/alert"
import { walletAPI } from "../services/api"

interface AddToWalletButtonProps {
  serialNumber: string
}

export function AddToWalletButton({ serialNumber }: AddToWalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddToWallet = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Requesting Google Wallet pass for serial:", serialNumber)
      
      const response = await walletAPI.createPass(serialNumber)
      
      console.log("[v0] Google Wallet response:", response)

      if (response.success && response.save_url) {
        // Rediriger vers Google Wallet
        window.location.href = response.save_url
      } else {
        setError("Erreur lors de la création du pass")
      }
    } catch (err: unknown) {
      const error = err as Error
      const msg = error.message || "Une erreur est survenue. Réessayez."
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      <Button
        onClick={handleAddToWallet}
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
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
            Ajouter à Google Wallet
          </span>
        )}
      </Button>

      <p className="text-xs text-gray-500">
        Disponible uniquement sur Android. La carte sera ajoutée à votre Google Wallet et accessible hors ligne.
      </p>
    </div>
  )
}
