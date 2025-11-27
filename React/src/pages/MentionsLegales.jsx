// Page "Mentions légales" — informations légales obligatoires
import "../css/APropos.css"; // réutilise style unifié
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta.jsx";

const MentionsLegales = () => {
    usePageMeta({
        title: "Mentions légales - Porsche",
        description:
            "Mentions légales du site Porsche : informations sur l'éditeur, l'hébergeur, les conditions d'utilisation et les contacts.",
    });

    return (
        <div className="apropos-container-porsche">
            <div className="apropos-card-porsche">
                <h1 className="apropos-title-porsche">Mentions légales</h1>

                <p className="apropos-text-porsche">
                    Conformément aux dispositions légales, voici les informations concernant
                    l'éditeur et l'hébergeur du site.
                </p>

                <h2 className="apropos-subtitle-porsche">Éditeur du site</h2>
                <p className="apropos-text-porsche">
                    Raison sociale : Porsche
                    <br />
                    Siège social : 1 Rue de l'Empereur, 75017 Paris, France
                    <br />
                    SIREN/SIRET : 000 000 000 00000
                    <br />
                    Numéro de TVA intracommunautaire : FR00 000000000
                </p>

                <h2 className="apropos-subtitle-porsche">Directeur de la publication</h2>
                <p className="apropos-text-porsche">M. Directeur Exemple</p>

                <h2 className="apropos-subtitle-porsche">Hébergeur</h2>
                <p className="apropos-text-porsche">
                    Hébergeur : Exemple Hosting
                    <br />
                    Adresse : 10 Avenue de Bonne Nouvelle, 75010 Paris
                    <br />
                    Téléphone : 01 23 45 67 89
                </p>

                <h2 className="apropos-subtitle-porsche">Propriété intellectuelle</h2>
                <p className="apropos-text-porsche">
                    Tous les contenus présents sur ce site (textes, images, logos) sont
                    protégés par le droit de la propriété intellectuelle et restent la
                    propriété de Porsche ou de ses ayants droit. Toute reproduction est
                    interdite sans autorisation préalable.
                </p>

                <h2 className="apropos-subtitle-porsche">Conditions d'utilisation</h2>
                <p className="apropos-text-porsche">
                    L'accès au site implique l'acceptation sans réserve des présentes
                    mentions légales et des conditions d'utilisation. Porsche peut mettre
                    à jour ces mentions à tout moment.
                </p>

                <h2 className="apropos-subtitle-porsche">Contact</h2>
                <p className="apropos-text-porsche">
                    Pour toute question juridique, contactez :
                    <br />
                    Email : <strong>legal@porsche.fr</strong>
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

export default MentionsLegales;
