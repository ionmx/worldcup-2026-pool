import { bgImage } from '../assets';
import { Sidebar } from './Sidebar';

type AppLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export const AppLayout = ({ children, className = '' }: AppLayoutProps) => {
  return (
    <>
      {/* Fixed background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, black, transparent 30%, transparent 70%, black), url(${bgImage})`,
        }}
      />
      {/* Layout container */}
      <div className="flex min-h-screen text-white">
        <Sidebar />
        <main className={`flex-1 ${className}`}>{children}</main>
      </div>
    </>
  );
};
