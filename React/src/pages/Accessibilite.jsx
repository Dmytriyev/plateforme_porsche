// Page "Déclaration d'accessibilité" — conformité accessibilité et contact
import "../css/APropos.css"; // réutilise style unifié
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta.jsx";

const Accessibilite = () => {
    usePageMeta({
        title: "Déclaration d'accessibilité - Porsche",
        description:
            "Déclaration d'accessibilité du site Porsche : engagement, conformité aux normes WCAG, contact pour signaler des problèmes.",
    });

    return (
        <div className="apropos-container-porsche">
            <div className="apropos-card-porsche">
                <h1 className="apropos-title-porsche">Déclaration d'accessibilité</h1>

                <p className="apropos-text-porsche">
                    Porsche s'engage à rendre son site accessible conformément aux
                    exigences légales et aux recommandations internationales (WCAG 2.1
                    niveau AA) afin de permettre l'accès au plus grand nombre.
                </p>

                <h2 className="apropos-subtitle-porsche">État de conformité</h2>
                <p className="apropos-text-porsche">
                    Nous travaillons activement à la mise en conformité du site avec les
                    critères WCAG 2.1 AA. Certaines parties du site peuvent cependant
                    ne pas encore être totalement conformes en raison de contenus
                    hérités, de documents fournis par des tiers ou d'éléments techniques.
                </p>

                <h2 className="apropos-subtitle-porsche">Mesures prises</h2>
                <ul className="apropos-list-porsche">
                    <li>Conception accessible des nouvelles pages et composants.</li>
                    <li>Contrôles réguliers d'accessibilité (tests automatisés et manuels).</li>
                    <li>Formation des équipes de développement et contenu.</li>
                    <li>Mise en place d'un parcours clair pour signaler les problèmes d'accessibilité.</li>
                </ul>

                <h2 className="apropos-subtitle-porsche">Contenu non accessible</h2>
                <p className="apropos-text-porsche">
                    Certains documents (PDF, vidéos sans sous-titres) ou contenus fournis
                    par des partenaires peuvent ne pas respecter les critères d'accessibilité.
                    Nous indiquons, lorsque c'est possible, des alternatives (format texte,
                    transcription) et travaillons à les rendre accessibles.
                </p>

                <h2 className="apropos-subtitle-porsche">Signaler un problème</h2>
                <p className="apropos-text-porsche">
                    Si vous rencontrez des difficultés d'accès, contactez notre référent
                    accessibilité à l'adresse <strong>accessibilite@porsche.fr</strong> ou via
                    le formulaire de contact. Merci d'indiquer la page concernée, une
                    description du problème et, si possible, une capture d'écran.
                </p>

                <h2 className="apropos-subtitle-porsche">Procédure de traitement</h2>
                <p className="apropos-text-porsche">
                    Nous accusons réception de votre signalement sous 5 jours ouvrés et
                    nous efforçons de proposer une solution sous 30 jours, sauf contraintes
                    techniques majeures. En cas d'absence de réponse satisfaisante, vous
                    pouvez saisir l'autorité compétente.
                </p>

                <h2 className="apropos-subtitle-porsche">Compatibilité</h2>
                <p className="apropos-text-porsche">
                    Le site est conçu pour être compatible avec les navigateurs modernes et
                    les technologies d'assistance (lecteurs d'écran, agrandisseurs).
                </p>

                <p className="apropos-text-porsche">
                    Date de dernière mise à jour : <strong>26 novembre 2025</strong>.
                </p>

                <div className="apropos-actions-porsche">
                    <Link to="/contact" className="apropos-btn-porsche">
                        Nous contacter
                    </Link>
                    <Link to="/" className="apropos-btn-outline-porsche">
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Accessibilite;
