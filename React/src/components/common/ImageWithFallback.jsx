import { useState } from "react";

// ImageWithFallback: affiche l'image si src valide, sinon render `placeholder`.
// Props:
// - src: string | null
// - alt: string
// - imgClass: string
// - placeholder: JSX element
// - imgProps: additional props to pass to <img>
const ImageWithFallback = ({ src, alt, imgClass, placeholder, imgProps = {} }) => {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return placeholder || null;
    }

    return (
        <img
            src={src}
            alt={alt}
            className={imgClass}
            onError={() => setFailed(true)}
            onLoad={() => setFailed(false)}
            {...imgProps}
        />
    );
};

export default ImageWithFallback;
