import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({ className = '', children, ...props }: ButtonProps) => {
  return (
    <button
      className={`flex items-center justify-center border border-white/20 rounded-full text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline hover:cursor-pointer hover:bg-black/20 transition-colors duration-300 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
