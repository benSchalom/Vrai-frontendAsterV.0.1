import RegistrationForm from "../componnents/RegistrationForm"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenue sur Aster</h1>
          <p className="text-gray-600">Créez votre compte professionnel et commencez à fidéliser vos clients</p>
        </div>
        <RegistrationForm />
      </div>
    </div>
  )
}
