// Cette page permet d'accéder au même formulaire que les boutons "Nous contacter"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContactModal from "../components/modals/ContactModal.jsx";
import "../css/components/ContactModal.css";
import usePageMeta from "../utils/usePageMeta.jsx";

// Page de contact avec formulaire dans un modal 
const Contact = () => {
    const navigate = useNavigate();

    // Si l'utilisateur ferme le formulaire, on revient à la page précédente.
    const handleClose = () => {
        // Si on a un historique, on revient en arrière, sinon on envoie vers l'accueil
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
    };

    // Met le focus dans le modal au chargement pour l'accessibilité
    useEffect(() => {
        // s'assure que le focus clavier est dans le modal pour accessibilité
        const el = document.querySelector(".contact-modal");
        if (el) el.focus();
    }, []);
    // Met à jour les métadonnées de la page
    usePageMeta({
        title: "Contact - Porsche",
        description: "Contactez notre équipe Porsche pour toute question sur les modèles, services ou accessoires.",
    });

    return <ContactModal onClose={handleClose} />;
};

export default Contact;
