// Fil d'Ariane pour navigation dans les pages d'accessoires
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items }) => {
    return (
        <nav className="accessoire-breadcrumb" aria-label="Fil d'Ariane">
            <ol style={{ display: "flex", listStyle: "none", padding: 0, margin: 0 }}>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} style={{ display: "flex", alignItems: "center" }}>
                            {!isLast && item.path ? (
                                <Link to={item.path} className="breadcrumb-link">
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={isLast ? "breadcrumb-current" : "breadcrumb-link"}
                                    aria-current={isLast ? "page" : undefined}
                                >
                                    {item.label}
                                </span>
                            )}

                            {!isLast && (
                                <span className="breadcrumb-separator" aria-hidden="true">
                                    /
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

Breadcrumb.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            path: PropTypes.string,
        })
    ).isRequired,
};

export default Breadcrumb;
