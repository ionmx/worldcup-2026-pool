import { Link, type LinkProps } from 'react-router-dom';

type LinkButtonProps = LinkProps & {
  variant?: 'primary' | 'secondary';
};

export const LinkButton = ({
  children,
  className = '',
  variant = 'primary',
  ...props
}: LinkButtonProps) => {
  const baseStyles =
    'flex items-center justify-center rounded-full font-bold py-2 px-4 focus:outline-none focus:shadow-outline hover:cursor-pointer transition-colors duration-300';
  const variants = {
    primary: 'border border-white/20 text-white hover:bg-black/20',
    secondary: 'text-white/60 hover:text-white',
  };

  return (
    <Link
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
};
