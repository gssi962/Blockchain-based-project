const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  onClick,
  disabled = false,
  loading = false,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`cs-button cs-button-${variant} cs-button-${size} ${className}`}
    >
      {loading ? (
        <>
          <span className="button-spinner"></span>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;