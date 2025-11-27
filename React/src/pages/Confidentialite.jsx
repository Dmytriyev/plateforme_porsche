// Page "Politique de confidentialité" — contenu informatif et boutons centrés
import "../css/APropos.css"; // réutilise le style unifié
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta.jsx";

const Confidentialite = () => {
    usePageMeta({
        title: "Politique de confidentialité - Porsche",
        description:
            "Politique de confidentialité de la plateforme Porsche : collecte, usage et protection des données personnelles.",
    });

    return (
        <div className="apropos-container-porsche">
            <div className="apropos-card-porsche">
                <h1 className="apropos-title-porsche">Politique de confidentialité</h1>

                <p className="apropos-text-porsche">
                    La présente politique décrit la manière dont Porsche collecte, utilise et
                    protège les données personnelles des utilisateurs de la plateforme,
                    conformément au Règlement Général sur la Protection des Données
                    (RGPD) et à la loi Informatique et Libertés.
                </p>

                <h2 className="apropos-subtitle-porsche">1. Responsable du traitement</h2>
                <p className="apropos-text-porsche">
                    Responsable du traitement : Porsche (ou la société exploitante de la
                    plateforme). Pour toute question relative au traitement des données,
                    vous pouvez nous contacter à l'adresse email : <strong>contact@porsche.fr</strong>.
                </p>

                <h2 className="apropos-subtitle-porsche">2. Délégué à la protection des données (DPO)</h2>
                <p className="apropos-text-porsche">
                    Vous pouvez contacter notre DPO à l'adresse : <strong>dpo@porsche.fr</strong>.
                    Le DPO répondra aux questions relatives aux traitements et à l'exercice
                    de vos droits.
                </p>

                <h2 className="apropos-subtitle-porsche">3. Données collectées</h2>
                <p className="apropos-text-porsche">
                    Nous collectons les catégories de données suivantes selon les besoins :
                    identité (nom, prénom), coordonnées (email, adresse postale, téléphone),
                    informations de facturation, informations liées aux véhicules, données
                    techniques (adresse IP, cookies, logs), et données issues du support client.
                </p>

                <h2 className="apropos-subtitle-porsche">4. Finalités et bases légales</h2>
                <p className="apropos-text-porsche">
                    Les données sont traitées pour :
                </p>
                <ul className="apropos-list-porsche">
                    <li>Exécution du contrat et traitement des commandes (base : exécution du contrat).</li>
                    <li>Obligations légales (base : conformité légale).</li>
                    <li>Service client et gestion des réclamations (base : intérêt légitime ou consentement selon le contexte).</li>
                    <li>Marketing, newsletters et communications commerciales (base : consentement explicite ; vous pouvez retirer ce consentement à tout moment).</li>
                </ul>

                <h2 className="apropos-subtitle-porsche">5. Durées de conservation</h2>
                <p className="apropos-text-porsche">
                    Les données sont conservées pendant la durée nécessaire aux finalités
                    pour lesquelles elles sont collectées, puis archivées selon les
                    obligations légales. Exemples indicatifs : données de compte tant que
                    le compte existe ; données de facturation et transactionnelles conservées
                    pendant 5 ans pour conformité fiscale; logs techniques conservés 1 an.
                </p>

                <h2 className="apropos-subtitle-porsche">6. Destinataires et transferts</h2>
                <p className="apropos-text-porsche">
                    Vos données peuvent être communiquées aux prestataires techniques,
                    prestataires de paiement, partenaires logistiques et autorités
                    compétentes lorsque la loi l'exige. Les transferts hors de l'Union
                    européenne sont encadrés et sécurisés (clauses contractuelles types,
                    mesures appropriées).
                </p>

                <h2 className="apropos-subtitle-porsche">7. Vos droits</h2>
                <p className="apropos-text-porsche">
                    Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="apropos-list-porsche">
                    <li>Droit d'accès : obtenir la confirmation que des données vous concernant sont traitées et en obtenir une copie.</li>
                    <li>Droit de rectification : demander la correction des données inexactes.</li>
                    <li>Droit à l'effacement (« droit à l'oubli ») lorsque les conditions sont remplies.</li>
                    <li>Droit à la limitation du traitement.</li>
                    <li>Droit d'opposition au traitement pour motifs légitimes.</li>
                    <li>Droit à la portabilité des données lorsque le traitement est fondé sur le consentement ou l'exécution d'un contrat.</li>
                </ul>
                <p className="apropos-text-porsche">
                    Pour exercer vos droits, contactez-nous à <strong>contact@porsche.fr</strong> ou
                    adressez-vous au DPO (<strong>dpo@porsche.fr</strong>). Vous pouvez également
                    déposer une réclamation auprès de l'autorité de contrôle compétente (en
                    France : la CNIL) si vous estimez que vos droits ne sont pas respectés.
                </p>

                <h2 className="apropos-subtitle-porsche">8. Sécurité</h2>
                <p className="apropos-text-porsche">
                    Nous mettons en œuvre des mesures techniques et organisationnelles
                    proportionnées (chiffrement, contrôles d'accès, sauvegardes) pour
                    protéger les données contre la destruction, la perte, l'altération et
                    l'accès non autorisé.
                </p>

                <h2 className="apropos-subtitle-porsche">9. Cookies et traceurs</h2>
                <p className="apropos-text-porsche">
                    Nous utilisons des cookies et traceurs pour le fonctionnement du site,
                    l'analytics et le marketing. Un bandeau cookies vous permet d'accepter
                    ou de paramétrer ces traceurs. Consultez notre page dédiée aux cookies
                    pour plus d'informations.
                </p>

                <h2 className="apropos-subtitle-porsche">10. Modifications de la politique</h2>
                <p className="apropos-text-porsche">
                    Nous pouvons mettre à jour cette politique. Les changements importants
                    seront signalés et la date de mise à jour sera indiquée.
                </p>

                <p className="apropos-text-porsche">
                    Pour toute question ou pour exercer vos droits, contactez-nous :
                    <strong> contact@porsche.fr</strong> ou <strong>dpo@porsche.fr</strong>.
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

export default Confidentialite;
