import React from "react";

/**
 * ToggleGroup - A versatile toggle component supporting multiple variants
 * 
 * Variants:
 * - "segmented" - Horizontal segmented control (like iOS)
 * - "pills" - Pill-style buttons in a row
 * - "cards" - Card-style selection with optional icons/descriptions
 */
const ToggleGroup = ({
  label,
  name,
  value,
  onChange,
  options = [],
  variant = "segmented",
  required = false,
  error,
  columns = 2, // For cards variant
  className = "",
}) => {
  const handleChange = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue,
      },
    });
  };

  const renderSegmented = () => (
    <div className="toggle-group w-full">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleChange(option.value)}
          className={`
            toggle-button flex-1
            ${value === option.value ? "toggle-button-active" : ""}
          `}
        >
          {option.icon && <span className="mr-2">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );

  const renderPills = () => (
    <div className="pill-toggle">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleChange(option.value)}
          className={`
            pill-option
            ${value === option.value ? "pill-option-active" : "pill-option-inactive"}
          `}
        >
          {option.icon && <span className="mr-2">{option.icon}</span>}
          {option.label}
        </button>
      ))}
    </div>
  );

  const renderCards = () => (
    <div
      className={`grid gap-3`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleChange(option.value)}
            className={`
              relative p-4 rounded-xl text-left
              border-2 transition-all duration-200 ease-smooth
              ${
                isSelected
                  ? "border-ink bg-ink/5"
                  : "border-surface-200 bg-white hover:border-surface-300"
              }
            `}
          >
            {/* Selection indicator */}
            <div
              className={`
                absolute top-3 right-3 w-5 h-5 rounded-full
                flex items-center justify-center
                transition-all duration-200
                ${isSelected ? "bg-ink" : "border-2 border-surface-300"}
              `}
            >
              {isSelected && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>

            {/* Icon */}
            {option.icon && (
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center mb-3
                  ${isSelected ? "bg-ink text-white" : "bg-surface-100 text-ink-muted"}
                  transition-colors duration-200
                `}
              >
                {option.icon}
              </div>
            )}

            {/* Label */}
            <p
              className={`
                font-medium text-sm
                ${isSelected ? "text-ink" : "text-ink-light"}
              `}
            >
              {option.label}
            </p>

            {/* Description */}
            {option.description && (
              <p className="text-xs text-ink-muted mt-1">{option.description}</p>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderVariant = () => {
    switch (variant) {
      case "pills":
        return renderPills();
      case "cards":
        return renderCards();
      case "segmented":
      default:
        return renderSegmented();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`form-label ${required ? "form-label-required" : ""}`}>
          {label}
        </label>
      )}

      {renderVariant()}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
};

export default ToggleGroup;

