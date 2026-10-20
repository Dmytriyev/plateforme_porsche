// Page "Politique de cookies" — informations sur les cookies et gestion du consentement
import "../css/APropos.css"; // réutilise le style unifié
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta.jsx";

const PolitiqueCookies = () => {
    usePageMeta({
        title: "Politique de cookies - Porsche",
        description:
            "Politique de cookies de la plateforme Porsche : types de cookies, finalités, durée de conservation et gestion du consentement.",
    });

    return (
        <div className="apropos-container-porsche">
            <div className="apropos-card-porsche">
                <h1 className="apropos-title-porsche">Politique de cookies</h1>

                <p className="apropos-text-porsche">
                    Les cookies et traceurs sont utilisés sur la plateforme Porsche pour
                    améliorer votre expérience, analyser le trafic et proposer des
                    contenus adaptés. Cette politique explique quels cookies sont utilisés
                    et comment vous pouvez gérer vos choix.
                </p>

                <h2 className="apropos-subtitle-porsche">1. Qu'est-ce qu'un cookie ?</h2>
                <p className="apropos-text-porsche">
                    Un cookie est un petit fichier texte placé sur votre appareil par le
                    site web que vous visitez. Il permet de reconnaître votre navigateur
                    et de mémoriser certaines informations (préférences, panier, etc.).
                </p>

                <h2 className="apropos-subtitle-porsche">2. Types de cookies utilisés</h2>
                <ul className="apropos-list-porsche">
                    <li>Cookies strictement nécessaires : indispensables au fonctionnement du site.</li>
                    <li>Cookies de performance / analytics : mesurent l'utilisation et améliorent le service (ex : Google Analytics).</li>
                    <li>Cookies fonctionnels : mémorisent des choix (langue, préférences).</li>
                    <li>Cookies publicitaires / de ciblage : affichent des publicités adaptées et mesurent leur efficacité.</li>
                </ul>

                <h2 className="apropos-subtitle-porsche">3. Finalités</h2>
                <p className="apropos-text-porsche">
                    Les cookies servent à assurer le bon fonctionnement du site, à
                    améliorer les performances, à personnaliser l'affichage et à proposer
                    des contenus publicitaires pertinents selon les choix et le comportement
                    de navigation.
                </p>

                <h2 className="apropos-subtitle-porsche">4. Durée de conservation</h2>
                <p className="apropos-text-porsche">
                    La durée de conservation varie selon le cookie : certains sont
                    supprimés à la fermeture du navigateur, d'autres restent plusieurs mois
                    selon leur finalité. Les cookies publicitaires peuvent être conservés
                    plus longtemps par des tiers.
                </p>

                <h2 className="apropos-subtitle-porsche">5. Gestion du consentement</h2>
                <p className="apropos-text-porsche">
                    Lors de votre première visite, un bandeau cookies vous permet d'accepter
                    ou de paramétrer les traceurs. Vous pouvez modifier vos choix à tout
                    moment via les paramètres cookies de votre navigateur ou en utilisant
                    notre outil de gestion des préférences disponible sur le site.
                </p>

                <h2 className="apropos-subtitle-porsche">6. Cookies tiers</h2>
                <p className="apropos-text-porsche">
                    Certains cookies sont déposés par des partenaires (analytics,
                    réseaux sociaux, publicitaires). Ces tiers ont leurs propres politiques
                    et moyens pour gérer le consentement : consultez leurs sites pour plus
                    d'informations.
                </p>

                <h2 className="apropos-subtitle-porsche">7. Comment refuser les cookies</h2>
                <p className="apropos-text-porsche">
                    Vous pouvez :
                </p>
                <ul className="apropos-list-porsche">
                    <li>dès le bandeau cookies, refuser les catégories non nécessaires ;</li>
                    <li>paramétrer votre navigateur pour bloquer ou supprimer les cookies ;</li>
                    <li>utiliser les outils de désactivation des fournisseurs (ex : Google).</li>
                </ul>

                <h2 className="apropos-subtitle-porsche">8. Contact</h2>
                <p className="apropos-text-porsche">
                    Pour toute question sur les cookies, contactez notre DPO à
                    <strong> dpo@porsche.fr</strong> ou via le formulaire de contact.
                </p>

                <div className="apropos-actions-porsche">
                    <Link to="/contact" className="apropos-btn-porsche">Nous contacter</Link>
                    <Link to="/" className="apropos-btn-outline-porsche">Retour à l'accueil</Link>
                </div>
            </div>
        </div>
    );
};

export default PolitiqueCookies;
