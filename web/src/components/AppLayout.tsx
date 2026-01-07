import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { bgImage, worldcupLogo } from '../assets';
import { useAuth, useLeague } from '../hooks';
import { DevToolsPanel } from './DevToolsPanel';
import { LeaguePicture } from './LeaguePicture';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';

type AppLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export const AppLayout = ({ children, className = '' }: AppLayoutProps) => {
  const { userData } = useAuth();
  const { selectedLeague } = useLeague();

  const mobileNavItems = [
    {
      to: userData ? `/${userData.userName}` : '/',
      icon: '⚽',
      label: userData ? 'My Predictions' : 'All Matches',
    },
    { to: '/leaderboard', icon: '🥇', label: 'Leaderboard' },
    { to: '/leagues', icon: '🏆', label: 'Leagues' },
  ];

  // Fallback: hide splash after 1 second (for pages without data loading)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      window.hideSplash?.();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile header + content */}
        <div className="flex-1 flex flex-col md:block">
          {/* Mobile header */}
          <header
            className="md:hidden sticky top-0 z-20 bg-black/80 backdrop-blur-lg border-b border-white/10 px-4 py-0"
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
          >
            <div className="flex items-center justify-between pb-3">
              <Link
                to={selectedLeague ? `/league/${selectedLeague.slug}` : '/'}
                className="flex items-center gap-2"
              >
                {selectedLeague ? (
                  <>
                    <LeaguePicture
                      src={selectedLeague.imageURL}
                      name={selectedLeague.name}
                      size="sm"
                    />
                    <span className="text-white font-medium text-sm truncate max-w-48">
                      {selectedLeague.name}
                    </span>
                  </>
                ) : (
                  <>
                    <img
                      src={worldcupLogo}
                      alt="World Cup 2026"
                      className="h-8"
                    />
                    <span className="text-white font-light text-xs">
                      FIFA WC 2026 POOL
                    </span>
                  </>
                )}
              </Link>
              <UserMenu mobile />
            </div>
          </header>

          <main className={`flex-1 pb-20 md:pb-0 ${className}`}>
            {children}
          </main>

          {/* Mobile bottom navigation */}
          <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-black/90 backdrop-blur-lg border-t border-white/10"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex justify-around items-center py-2">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white/70'
                    }`
                  }
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[10px]">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Dev Tools (only in dev mode for admins) */}
      <DevToolsPanel />
    </>
  );
};
