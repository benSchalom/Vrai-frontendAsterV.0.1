export const COUNTRIES = [
    { code: "DZ", label: "🇩🇿 Algérie" },
    { code: "DE", label: "🇩🇪 Allemagne" },
    { code: "BE", label: "🇧🇪 Belgique" },
    { code: "BJ", label: "🇧🇯 Bénin" },
    { code: "BF", label: "🇧🇫 Burkina Faso" },
    { code: "CM", label: "🇨🇲 Cameroun" },
    { code: "CA", label: "🇨🇦 Canada" },
    { code: "CI", label: "🇨🇮 Côte d'Ivoire" },
    { code: "ES", label: "🇪🇸 Espagne" },
    { code: "US", label: "🇺🇸 États-Unis" },
    { code: "FR", label: "🇫🇷 France" },
    { code: "HT", label: "🇭🇹Haïti" },
    { code: "IT", label: "🇮🇹 Italie" },
    { code: "LU", label: "🇱🇺 Luxembourg" },
    { code: "ML", label: "🇲🇱 Mali" },
    { code: "MA", label: "🇲🇦 Maroc" },
    { code: "PT", label: "🇵🇹 Portugal" },
    { code: "GB", label: "🇬🇧 Royaume-Uni" },
    { code: "SN", label: "🇸🇳 Sénégal" },
    { code: "TG", label: "🇹🇬 Togo" },
    { code: "TN", label: "🇹🇳 Tunisie" },
].sort((a, b) => {
    // On trie par le label sans le drapeau (le label commence par l'emoji puis un espace)
    const nameA = a.label.split(' ').slice(1).join(' ');
    const nameB = b.label.split(' ').slice(1).join(' ');
    return nameA.localeCompare(nameB, 'fr');
});
