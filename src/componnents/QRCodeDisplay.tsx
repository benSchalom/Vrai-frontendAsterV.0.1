import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { colors } from "../constants/colors"

interface QRCodeDisplayProps {
  slug: string
  businessName: string
  brandColor?: string
}

export default function QRCodeDisplay({ slug, businessName, brandColor = colors.primary }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const enrollmentUrl = `${window.location.origin}/enroll/${slug}`

  useEffect(() => {
    generateQRCode()
  }, [slug, brandColor])

  const generateQRCode = async () => {
    if (!canvasRef.current) return

    try {

      const QRCode = await import("qrcode")

      await QRCode.toCanvas(canvasRef.current, enrollmentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: brandColor,
          light: "#FFFFFF",
        },
      })
    } catch (error) {
      console.error("Erreur génération QR Code:", error)
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current) return

    const link = document.createElement("a")
    link.download = `qr-code-${slug}.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const handleShare = async () => {
    if (navigator.share && canvasRef.current ) {
      try {
        const blob = await new Promise<Blob | null>(resolve => canvasRef.current?.toBlob(resolve));
        if (!blob) return;

        const file = new File([blob], "qr-code.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `QR Code - ${businessName}`,
          });
        } else {
          await navigator.share({
            title: `Inscription - ${businessName}`,
            text: `Scannez ce QR code pour rejoindre mon programme de fidélité`,
            url: enrollmentUrl,
          })
        }
      } catch (error) {
        console.error("Erreur partage:", error)
      }
    } else {
      // Fallback: copier dans le presse-papiers
      navigator.clipboard.writeText(enrollmentUrl)
      alert("Lien copié dans le presse-papiers!")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" style={{ color: brandColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
            />
          </svg>
          QR Code d'inscription
        </CardTitle>
        <CardDescription>
          Partagez ce QR code avec vos clients pour les inscrire à votre programme de fidélité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Affichage du QR Code */}
        <div className="flex flex-col items-center">
          <div className="p-6 rounded-xl border-2 bg-white" style={{ borderColor: brandColor }}>
            <canvas ref={canvasRef} />
          </div>
          <p className="text-sm mt-4 text-center max-w-md" style={{ color: colors.textLight }}>
            Les clients peuvent scanner ce code pour s'inscrire à votre programme
          </p>
        </div>

        {/* Affichage de l'URL */}
        <div className="p-4 rounded-lg border bg-gray-50">
          <p className="text-xs font-medium mb-2" style={{ color: colors.textLight }}>
            Lien d'inscription
          </p>
          <p className="text-sm font-mono break-all" style={{ color: colors.text }}>
            {enrollmentUrl}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={handleDownload} variant="outline" className="w-full bg-transparent">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Télécharger QR Code
          </Button>
          <Button onClick={handleShare} className="w-full text-white" style={{ backgroundColor: brandColor }}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Partager
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 rounded-lg" style={{ backgroundColor: brandColor + "15" }}>
          <h4 className="font-semibold mb-2" style={{ color: colors.text }}>
            Comment utiliser ce QR Code ?
          </h4>
          <ul className="space-y-1 text-sm" style={{ color: colors.textLight }}>
            <li>• Affichez ce QR code dans votre établissement</li>
            <li>• Les clients le scannent avec leur smartphone</li>
            <li>• Ils remplissent un formulaire rapide</li>
            <li>• Une carte de fidélité digitale est créée instantanément</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
