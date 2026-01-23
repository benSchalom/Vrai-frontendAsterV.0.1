import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../componnents/ui/card"
import { Button } from "../componnents/ui/button"
import { Input } from "../componnents/ui/input"
import { Label } from "../componnents/ui/label"
import { Alert, AlertDescription, AlertTitle } from "../componnents/ui/alert"
import { colors } from "../constants/colors"
import { storage } from "../services/storage"
import { proAPI } from "../services/api"
import type { ProRegistration } from "../types/models"
import { COUNTRIES } from "../constants/countries"

const REWARD_TYPES = [
    { value: "SERVICE OFFERT", label: "Service offert" },
    { value: "REDUCTION", label: "Réduction" },
]

export default function SettingsPage() {
    const { slug } = useParams<{ slug: string }>()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [error, setError] = useState("")
    const [formData, setFormData] = useState<Partial<ProRegistration>>({
        nom: "",
        business_nom: "",
        brand_color: "",
        logo_url: "",
        reward_limit: 10,
        reward_type: "SERVICE OFFERT",
        pays: "CA"
    })
    const [countrySearch, setCountrySearch] = useState("")

    useEffect(() => {
        const cachedPro = storage.getProInfo()
        if (!cachedPro) {
            navigate("/")
            return
        }
        setFormData({
            nom: cachedPro.nom,
            business_nom: cachedPro.business_nom,
            brand_color: cachedPro.brand_color,
            logo_url: cachedPro.logo_url,
            reward_limit: cachedPro.reward_limit,
            reward_type: cachedPro.reward_type,
            pays: cachedPro.pays || "CA"
        })
        setLogoPreview(cachedPro.logo_url || ""); // Initialise l'aperçu avec l'URL existante
    }, [slug])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess(false)

        try {
            const fd = new FormData();
            fd.append('nom', formData.nom || "");
            fd.append('business_nom', formData.business_nom || "");
            fd.append('brand_color', formData.brand_color || "");
            fd.append('reward_limit', (formData.reward_limit || 10).toString());
            fd.append('reward_type', formData.reward_type || "SERVICE OFFERT");
            fd.append('pays', formData.pays || "CA");

            if (logoFile) {
                fd.append('logo_url', logoFile);
            }

            const response = await proAPI.update(fd)

            if (response.data.success) {
                setSuccess(true)
                storage.setProInfo(response.data.pro)
                setLogoPreview(response.data.pro.logo_url || "");
                setLogoFile(null); // Réinitialise le fichier local
                setTimeout(() => setSuccess(false), 3000)
            } else {
                setError("Erreur lors de la mise à jour")
            }
        } catch (err: unknown) {
            setError("Le serveur est injoignable ou une erreur est survenue.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: colors.background }}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="outline" onClick={() => navigate(`/dashboard/${slug}`)}>
                        ← Retour
                    </Button>
                    <h1 className="text-2xl font-bold" style={{ color: colors.text }}>Paramètres de votre établissement</h1>
                </div>

                {success && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                        <AlertTitle>Succès !</AlertTitle>
                        <AlertDescription>Vos modifications ont été enregistrées.</AlertDescription>
                    </Alert>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Erreur</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Section: Identité */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Identité du commerce</CardTitle>
                            <CardDescription>Informations visibles par vos clients sur leur carte</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="business_nom">Nom de l'établissement</Label>
                                    <Input
                                        id="business_nom"
                                        value={formData.business_nom}
                                        onChange={e => setFormData(prev => ({ ...prev, business_nom: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nom">Propriétaire / Gérant</Label>
                                    <Input
                                        id="nom"
                                        value={formData.nom}
                                        onChange={e => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden">
                                        {logoPreview? (
                                            <img src={logoPreview} className="w-full h-full object-cover" alt="Logo preview"/>
                                        ) : (
                                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setLogoFile(file); // Prépare le fichier pour le FormData
                                                    setLogoPreview(URL.createObjectURL(file)); // Affiche l'aperçu immédiat
                                                }
                                            }}
                                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
                                        />
                                        {logoFile && (
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setLogoFile(null);
                                                    setLogoPreview(formData.logo_url || ""); // Revient au logo actuel
                                                }}
                                                className="text-xs text-red-500 text-left hover:underline"
                                            >
                                                Annuler
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pays">Pays</Label>
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
                                        value={formData.pays}
                                        onChange={(e) => setFormData(prev => ({ ...prev, pays: e.target.value }))}
                                        className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm outline-none"
                                    >
                                        {COUNTRIES.filter(c =>
                                            c.label.toLowerCase().includes(countrySearch.toLowerCase())
                                        ).map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section: Design */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Apparence & Design</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Label htmlFor="brand_color">Couleur de marque</Label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        id="brand_color"
                                        value={formData.brand_color}
                                        onChange={e => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                                        className="w-16 h-16 rounded cursor-pointer border-2"
                                    />
                                    <Input
                                        value={formData.brand_color}
                                        onChange={e => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                                        className="font-mono w-32"
                                    />
                                </div>
                                <div className="p-4 rounded-lg text-white text-center font-bold" style={{ backgroundColor: formData.brand_color }}>
                                    Aperçu de la couleur
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section: Fidélité */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Programme de Fidélité</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label>Type de récompense</Label>
                                <div className="grid gap-2">
                                    {REWARD_TYPES.map(r => (
                                        <label key={r.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${formData.reward_type === r.value ? 'bg-blue-50 border-blue-500' : 'bg-white'}`}>
                                            <input
                                                type="radio"
                                                name="reward_type"
                                                checked={formData.reward_type === r.value}
                                                onChange={() => setFormData(prev => ({ ...prev, reward_type: r.value as ProRegistration['reward_type'] }))}
                                            />
                                            <span>{r.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reward_limit">Points nécessaires pour une récompense</Label>
                                <Input
                                    id="reward_limit"
                                    type="number"
                                    value={formData.reward_limit}
                                    onChange={e => setFormData(prev => ({ ...prev, reward_limit: parseInt(e.target.value) }))}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" type="button" onClick={() => navigate(`/dashboard/${slug}`)}>Annuler</Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: colors.success, color: 'white' }}
                        >
                            {loading ? "Enregistrement..." : "Enregistrer les modifications ✓"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
