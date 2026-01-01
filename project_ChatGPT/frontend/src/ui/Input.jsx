import React from 'react';
import './Input.css';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  name,
}) => {
  return (
    <div className="input-container">
      {label && <label className="input-label">{label}</label>}
      <input
        className="input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default Input;
