/**
 * Utilitaires pour la manipulation d'images côté client.
 */

interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

/**
 * Compresse une image en utilisant un Canvas HTML5.
 * Retourne un objet File prêt à être envoyé par FormData.
 */
export const compressImage = async (
    file: File,
    options: CompressionOptions = {}
): Promise<File> => {
    const { maxWidth = 800, maxHeight = 800, quality = 0.7 } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calcul des nouvelles dimensions en gardant le ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return reject(new Error("Impossible de créer le contexte 2D du canvas"));
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return reject(new Error("La compression a échoué (Blob nul)"));
                        }
                        // Reconvertir le Blob en File pour garder le même format qu'avant
                        const compressedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.onerror = () => reject(new Error("Erreur lors du chargement de l'image"));
        };

        reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
    });
};

/**
 * Transforme une URL Cloudinary pour ajouter des optimisations automatiques (format, qualité, taille).
 * Exemple: https://res.cloudinary.com/demo/image/upload/sample.jpg
 * -> https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_500/sample.jpg
 */
export const getOptimizedImageUrl = (url: string | null | undefined, width = 500): string => {
    if (!url) return "";

    // Si ce n'est pas une URL Cloudinary (ex: blob local ou autre domaine), on ne transforme pas
    if (!url.includes("cloudinary.com")) return url;

    // Éviter de transformer une URL déjà optimisée
    if (url.includes("/f_auto,q_auto")) return url;

    try {
        // On insère les transformations après "/upload/"
        const parts = url.split("/upload/");
        if (parts.length === 2) {
            return `${parts[0]}/upload/f_auto,q_auto,w_${width}/${parts[1]}`;
        }
    } catch (e) {
        console.error("Erreur lors de l'optimisation de l'URL Cloudinary:", e);
    }

    return url;
};
