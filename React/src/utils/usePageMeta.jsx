import { useEffect } from "react";

// Hook utilitaire pour définir le title et la meta description d'une page
// Usage: usePageMeta({ title: 'Titre', description: 'Description pour SEO' })
const usePageMeta = ({ title, description }) => {
    useEffect(() => {
        if (title) {
            document.title = title;
        }

        if (description) {
            let meta = document.querySelector('meta[name="description"]');
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', 'description');
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', description);
        }

        // cleanup: optionnel — ne pas remettre l'ancien titre/description automatiquement
        // car le routeur/les autres pages appelleront aussi le hook.
    }, [title, description]);
};

export default usePageMeta;
