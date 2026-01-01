import React from 'react';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  className = '',
}) => {
  const variants = {
    primary: 'btn btn--primary',
    ghost: 'btn btn--ghost',
    outline: 'btn btn--outline',
    danger: 'btn btn--danger',
  };

  const sizes = {
    small: 'btn--small',
    medium: '',
    large: 'btn--large',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${variants[variant] || variants.primary} ${
        sizes[size] || ''
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
