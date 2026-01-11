import React from "react";

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helper,
  disabled = false,
  className = "",
  inputClassName = "",
  min,
  max,
  step,
  rows = 4,
  options = [], // For select type
  children, // For custom input rendering
}) => {
  const inputId = `field-${name}`;
  const hasError = Boolean(error);

  const baseInputClass = `
    form-input-base
    ${hasError ? "form-input-error" : ""}
    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
    ${inputClassName}
  `;

  const renderInput = () => {
    if (children) {
      return children;
    }

    if (type === "select") {
      return (
        <select
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={baseInputClass}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === "textarea") {
      return (
        <textarea
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={baseInputClass}
        />
      );
    }

    return (
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        step={step}
        className={baseInputClass}
      />
    );
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`form-label ${required ? "form-label-required" : ""}`}
        >
          {label}
        </label>
      )}
      
      {renderInput()}

      {helper && !hasError && <p className="form-helper">{helper}</p>}

      {hasError && <p className="form-error">{error}</p>}
    </div>
  );
};

export default FormField;

