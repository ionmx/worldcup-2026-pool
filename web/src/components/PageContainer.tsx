import { bgImage } from '../assets';

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const PageContainer = ({
  children,
  className = '',
}: PageContainerProps) => {
  return (
    <>
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, black, transparent 30%, transparent 70%, black), url(${bgImage})`,
        }}
      />
      {/* Scrollable content */}
      <div className={`min-h-screen text-white ${className}`}>{children}</div>
    </>
  );
};
