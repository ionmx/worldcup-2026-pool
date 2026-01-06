import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button = ({
  className = '',
  children,
  variant = 'primary',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'flex items-center justify-center rounded-full font-bold py-2 px-4 focus:outline-none focus:shadow-outline transition-colors duration-300';
  const variants = {
    primary: 'border border-white/20 text-white hover:bg-black/20',
    secondary: 'text-white/60 hover:text-white',
  };
  const disabledStyles = disabled
    ? 'opacity-40 cursor-not-allowed'
    : 'hover:cursor-pointer';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
