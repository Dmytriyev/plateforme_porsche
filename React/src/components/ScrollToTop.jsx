/**
 * ScrollToTop - Composant pour réinitialiser le scroll en haut de page
 * à chaque navigation entre les pages.
 * 
 * Utilisation: Placer ce composant dans <BrowserRouter> pour qu'il écoute
 * les changements de route via useLocation().
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll instantané vers le haut de la page
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant", // Pas d'animation pour une navigation plus rapide
        });
    }, [pathname]); // Se déclenche à chaque changement de route

    return null; // Ce composant ne rend rien visuellement
};

export default ScrollToTop;
