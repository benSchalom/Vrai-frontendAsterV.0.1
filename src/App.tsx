import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./screen/inscriptionPro"
import DashboardPage from "./screen/DashboardPage"
import EnrollmentPage from "./screen/InscriptionClient"
import CartePage from "./screen/CartePage"
import ScanPage from "./screen/ScanPage"
import { storage } from "./services/storage"
import { Navigate } from "react-router-dom";
import RecoveryPage from "./screen/RecoveryPage"


function App() {

  const proInfo = storage.getProInfo();

  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil - Formulaire d'inscription des pros */}
        <Route path="/" element={proInfo?.slug ? <Navigate to={`/dashboard/${proInfo.slug}`} /> : <HomePage />} />

        {/* Dash du pro - Accessible après inscription */}
        <Route path="/dashboard/:slug" element={<DashboardPage />} />

        <Route path="/dashboard/:slug/scan" element={<ScanPage />} />

        <Route path="/enroll/:slug" element={<EnrollmentPage />} />

        <Route path="/carte/:serial" element={<CartePage />} />

        <Route path="/recovery" element={<RecoveryPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
