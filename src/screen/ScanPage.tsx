import { useParams, useNavigate } from "react-router-dom"
import QRScanner from "../componnents/QRScanner"

export default function ScanPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(`/dashboard/${slug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Retour au Dashboard
          </button>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scanner une Carte</h1>
          <p className="text-gray-600">Scannez la carte de fidélité de votre client pour ajouter un point</p>
        </div>

        <QRScanner slug={slug || ""} />
      </div>
    </div>
  )
}
