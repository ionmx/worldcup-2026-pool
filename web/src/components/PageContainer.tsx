import { bgImage } from '../assets';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const PageContainer = ({ children, className = '' }: PageContainerProps) => {
  return (
    <div
      className={`min-h-screen bg-cover bg-center bg-no-repeat text-white ${className}`}
      style={{ backgroundImage: `linear-gradient(to bottom, black, transparent 30%, transparent 70%, black), url(${bgImage})` }}
    >
      {children}
    </div>
  );
};

