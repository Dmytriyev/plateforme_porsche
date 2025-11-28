// Page "Conditions générales" — contenu informatif et boutons centrés
import "../css/APropos.css";
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta.jsx";

const Conditions = () => {
    usePageMeta({
        title: "Conditions générales - Porsche",
        description:
            "Conditions générales de vente et d'utilisation de la plateforme Porsche. Lisez attentivement nos règles et engagements.",
    });

    return (
        <div className="apropos-container-porsche">
            <div className="apropos-card-porsche">
                <h1 className="apropos-title-porsche">Conditions générales</h1>
                <p className="apropos-text-porsche">
                    Les présentes conditions générales régissent l'accès et l'utilisation
                    de la plateforme Porsche (ci-après « la Plateforme »). Elles définissent
                    les droits et obligations des utilisateurs et de Porsche en matière
                    de consultation, d'achat, de livraison, de garantie et de protection
                    des données personnelles.
                </p>

                <h2 className="apropos-subtitle-porsche">1. Définitions</h2>
                <p className="apropos-text-porsche">
                    « Utilisateur » : toute personne accédant à la Plateforme.
                    « Vendeur » : Porsche ou ses partenaires commerciaux proposant des
                    véhicules ou accessoires sur la Plateforme. « Commande » : la
                    confirmation d'achat passée par l'Utilisateur.
                </p>

                <h2 className="apropos-subtitle-porsche">2. Commandes et acceptation</h2>
                <p className="apropos-text-porsche">
                    Toute commande est soumise à disponibilité et à l'acceptation
                    du Vendeur. La validation de la commande par l'Utilisateur vaut
                    acceptation des présentes conditions générales.
                </p>

                <h2 className="apropos-subtitle-porsche">3. Prix et paiement</h2>
                <p className="apropos-text-porsche">
                    Les prix affichés incluent toutes taxes comprises sauf indication
                    contraire. Les moyens de paiement acceptés sont indiqués lors du
                    processus de commande. En cas de paiement en ligne, les transactions
                    sont sécurisées par des prestataires de paiement tiers.
                </p>

                <h2 className="apropos-subtitle-porsche">4. Livraison et retrait</h2>
                <p className="apropos-text-porsche">
                    Les modalités de livraison (délais, coûts, lieux) sont précisées
                    lors de la commande. Pour certains véhicules, un retrait en
                    concession peut être proposé. Les délais indiqués sont estimatifs
                    et peuvent varier en fonction des stocks et des contrôles qualité.
                </p>

                <h2 className="apropos-subtitle-porsche">5. Droit de rétractation et retours</h2>
                <p className="apropos-text-porsche">
                    Conformément à la loi, l'Utilisateur dispose d'un droit de
                    rétractation pour les achats effectués en ligne, sous réserve des
                    exceptions prévues par la réglementation (notamment véhicules
                    personnalisés). Les modalités de retour et de remboursement sont
                    précisées dans la page dédiée et dans les emails de confirmation.
                </p>

                <h2 className="apropos-subtitle-porsche">6. Garanties</h2>
                <p className="apropos-text-porsche">
                    Les véhicules et accessoires vendus bénéficient des garanties
                    légales applicables. Des garanties commerciales supplémentaires
                    peuvent être proposées et seront précisées au moment de la vente.
                </p>

                <h2 className="apropos-subtitle-porsche">7. Responsabilité</h2>
                <p className="apropos-text-porsche">
                    Porsche met en œuvre des moyens raisonnables pour assurer l'exactitude
                    des informations publiées. La responsabilité de Porsche ne saurait
                    être engagée en cas d'erreurs typographiques, d'indisponibilité
                    temporaire ou d'événements indépendants de sa volonté.
                </p>

                <h2 className="apropos-subtitle-porsche">8. Protection des données</h2>
                <p className="apropos-text-porsche">
                    Les informations collectées lors des commandes sont traitées
                    conformément à notre politique de confidentialité. L'Utilisateur
                    dispose d'un droit d'accès, de rectification et de suppression des
                    données le concernant. Pour exercer ces droits, contactez-nous via
                    le formulaire de contact.
                </p>

                <h2 className="apropos-subtitle-porsche">9. Litiges et loi applicable</h2>
                <p className="apropos-text-porsche">
                    Les présentes conditions sont régies par le droit français. En cas
                    de litige, les parties s'efforceront de trouver une solution amiable
                    avant toute action judiciaire.
                </p>

                <p className="apropos-text-porsche">
                    Pour toute question relative à ces conditions, notre service client
                    est à votre disposition via le formulaire de contact ou par email
                    à contact@porsche.fr.
                </p>

                <h2 className="apropos-subtitle-porsche">10. Protection des données personnelles (RGPD)</h2>
                <p className="apropos-text-porsche">
                    Nous traitons les données personnelles des clients et utilisateurs
                    conformément au Règlement Général sur la Protection des Données
                    (RGPD). Les finalités incluent l'exécution des commandes, la gestion
                    des comptes, le service après-vente et la communication commerciale
                    sous réserve de votre consentement.
                </p>

                <p className="apropos-text-porsche">
                    Pour en savoir plus sur les traitements, vos droits (accès,
                    rectification, effacement, opposition, limitation, portabilité) et
                    pour contacter notre Délégué à la Protection des Données (DPO),
                    consultez la <a href="/confidentialite">Politique de confidentialité</a>.
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

export default Conditions;
