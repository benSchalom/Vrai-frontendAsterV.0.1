import RegistrationForm from "../componnents/RegistrationForm"
import { storage } from "../services/storage"
import { useNavigate } from "react-router-dom"
import { Button } from "../componnents/ui/button"
import { colors } from "../constants/colors"

export default function HomePage() {
  const navigate = useNavigate()
  const proInfo = storage.getProInfo()

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenue sur Aster</h1>
          <p className="text-gray-600">
            {proInfo ? "Ravi de vous revoir !" : "Créez votre compte professionnel et commencez à fidéliser vos clients"}
          </p>
        </div>

        {proInfo ? (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">👋</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{proInfo.business_nom}</h2>
              <p className="text-gray-500 text-sm">Votre session a expiré pour des raisons de sécurité.</p>
            </div>
            <div className="grid gap-3">
              <Button
                onClick={() => navigate("/recovery")}
                className="w-full h-12 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Se reconnecter (Récupération)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  storage.clearAll()
                  window.location.reload()
                }}
                className="w-full h-12"
              >
                Utiliser un autre compte
              </Button>
            </div>
          </div>
        ) : (
          <RegistrationForm />
        )}
      </div>
    </div>
  )
}
