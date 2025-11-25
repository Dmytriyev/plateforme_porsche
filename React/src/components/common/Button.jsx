/**
 * components/common/Button.jsx — Bouton standardisé; props: `variant`, `loading`.
 *
 * @file components/common/Button.jsx
 */

import "../../css/components/Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  fullWidth = false,
  type = "button",
  className = "",
  ...props
}) => {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && "btn-full",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
