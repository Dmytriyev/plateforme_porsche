//  Page "À propos de Porsche" avec informations sur la plateforme
import "../css/APropos.css";
import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta.jsx";

const APropos = () => {
    usePageMeta({
        title: "À propos - Porsche",
        description:
            "Découvrez la plateforme Porsche : modèles neufs et d'occasion, accessoires premium et service client dédié.",
    });

    return (
        <div className="apropos-container-porsche">
            <div className="apropos-card-porsche">
                <h1 className="apropos-title-porsche">À propos de Porsche</h1>

                <p className="apropos-text-porsche">
                    Bienvenue sur la plateforme officielle Porsche. Nous rassemblons
                    l'excellence automobile, des modèles neufs aux occasions sélectionnées,
                    associés à des accessoires haut de gamme et un service client dédié.
                </p>

                <p className="apropos-text-porsche">
                    Notre mission est de proposer une expérience d'achat transparente et
                    personnalisée, en mettant l'accent sur la qualité, l'innovation et le
                    conseil. Que vous cherchiez une nouvelle Porsche, une occasion
                    contrôlée ou des accessoires authentiques, nous vous accompagnons à
                    chaque étape.
                </p>

                <h2 className="apropos-subtitle-porsche">Nos engagements</h2>
                <ul className="apropos-list-porsche">
                    <li>Qualité et authenticité des véhicules</li>
                    <li>Transparence des informations et des prix</li>
                    <li>Service client réactif et professionnel</li>
                    <li>Respect de la confidentialité et sécurité des données</li>
                </ul>

                <div className="apropos-actions-porsche">
                    <Link to="/contact" className="apropos-btn-porsche">
                        Nous contacter
                    </Link>
                    <Link to="/choix-voiture" className="apropos-btn-outline-porsche">
                        Parcourir les voitures
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default APropos;
