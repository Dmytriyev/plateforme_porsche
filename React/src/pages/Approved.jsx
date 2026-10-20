import { Link } from "react-router-dom";
import usePageMeta from "../utils/usePageMeta.jsx";
import "../css/APropos.css";

const Approved = () => {
    usePageMeta({
        title: "Porsche Certifier — Contrôle & Garantie",
        description:
            "Découvrez le programme Porsche Certifier : inspections, historique du véhicule, garanties et services inclus pour les véhicules d'occasion Porsche.",
    });

    return (
        <div className="apropos-page-container">
            <div className="apropos-card">
                <section className="home-hero-section">
                    <div className="home-hero-content max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
                        <div className="home-hero-image-container w-full md:w-1/2">
                            <figure className="rounded-lg overflow-hidden shadow-xl">
                                <img
                                    src="/Image/porsche-911-50-ans.jpg.webp"
                                    alt="Porsche 911 50 ans"
                                    loading="lazy"
                                    className="w-full h-56 sm:h-72 md:h-96 object-cover"
                                />
                                <figcaption className="sr-only">Porsche 911 50 ans</figcaption>
                            </figure>
                        </div>

                        <div className="home-hero-text w-full md:w-1/2 text-center md:text-left">
                            <h1 className="home-hero-title text-3xl sm:text-4xl lg:text-5xl font-semibold">
                                Porsche Certifier
                            </h1>
                            <p className="home-hero-slogan mt-4 text-sm sm:text-base text-gray-600">
                                La garantie Porsche Approved vous apporte une nouvelle
                                tranquillité d'esprit.                            </p>
                        </div>
                    </div>
                </section>

                <section className="apropos-section">
                    <h2 className="apropos-section-title">Une tranquillité d'esprit totale</h2>
                    <p>
                        Avec la garantie Porsche Approved, vous pouvez profiter d'un
                        plaisir de conduire illimité ainsi que d'une nouvelle
                        tranquillité d'esprit. Quelle que soit la fréquence à
                        laquelle vous conduisez votre Porsche ou la distance
                        parcourue, la garantie Porsche Approved s'applique sans
                        limite de kilométrage pendant la durée du contrat et ce,
                        jusqu'à ce que le véhicule ait atteint l'âge de 15 ans,
                        même en l'absence de couverture de garantie antérieure.
                    </p>

                    <h2 className="apropos-section-title">Vos avantages en bref</h2>
                    <p className="apropos-text">
                        La garantie Porsche Approved offre une couverture complète et
                        des services premium pour préserver la valeur et la longévité
                        de votre Porsche.
                    </p>

                    <ul className="apropos-features">
                        <li>S'applique dans le monde entier, valable dans tous les Centres (Service) Porsche</li>
                        <li>Valable jusqu'à l'âge de 15 ans du véhicule; option jusqu'à 14 ans / 200 000 km</li>
                        <li>Durées flexibles : 12, 24 ou 36 mois, sans limitation de kilométrage pendant la durée</li>
                        <li>Couverture de tous les composants (hors pièces d'usure) — 100 % pièces & main-d'œuvre</li>
                        <li>Utilisation exclusive de pièces d'origine Porsche</li>
                        <li>Extensible, transmissible et compatible avec la revente</li>
                        <li>Garantie mobilité Porsche Assistance incluse</li>
                    </ul>
                </section>

                <section className="apropos-section">
                    <h2 className="apropos-section-title">Types de garantie</h2>
                    <p className="apropos-text">
                        La garantie Porsche Approved est proposée dans différents cas :
                    </p>
                    <ul className="apropos-list">
                        <li>En prolongation d'une garantie existante sur un véhicule neuf ou d'une garantie Porsche Approved.</li>
                        <li>En tant que garantie véhicule d'occasion lors de l'achat d'un véhicule d'occasion Porsche Approved.</li>
                        <li>En tant que garantie individuelle pour un véhicule non couvert par une garantie et ayant passé avec succès les 111 points de contrôle.</li>
                    </ul>

                    <p className="apropos-footnote">
                        * La réalisation des 111 points de contrôle entraîne des frais
                        supplémentaires qui vous seront précisés par votre Centre (Service) Porsche.
                    </p>
                </section>

                <div className="apropos-actions">
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

export default Approved;
