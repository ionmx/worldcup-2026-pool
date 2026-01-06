import { Link } from 'react-router-dom';
import { worldcupLogo, sidebarMenuBg } from '../assets';
import { useLeague } from '../hooks';
import { Card } from './Card';
import { LeaderboardList } from './LeaderboardList';
import { LeaguePicture } from './LeaguePicture';
import { UserMenu } from './UserMenu';

export const Sidebar = () => {
  const { selectedLeague } = useLeague();

  return (
    <aside className="w-80 shrink-0 p-4 h-screen sticky top-0">
      <Card className="h-full max-h-[calc(100vh-2rem)] flex flex-col rounded-xl after:hidden overflow-hidden">
        <div className="relative w-full flex flex-col overflow-hidden pb-1">
          <img
            src={sidebarMenuBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <Link
            to={selectedLeague ? `/league/${selectedLeague.slug}` : '/'}
            className="relative z-10 flex items-center justify-center py-6 hover:opacity-90 transition-opacity"
          >
            {selectedLeague ? (
              <LeaguePicture
                src={selectedLeague.imageURL}
                name={selectedLeague.name}
                size="xl"
                className="h-32 w-32 drop-shadow-lg"
              />
            ) : (
              <img
                src={worldcupLogo}
                alt="World Cup 2026"
                className="h-32 drop-shadow-lg"
              />
            )}
          </Link>
          <div className="relative z-10 px-2 pb-2">
            <UserMenu />
          </div>
        </div>
        <div className="pt-4 flex-1 min-h-0 flex flex-col">
          <LeaderboardList />
        </div>
        {/* Footer Links */}
        <div className="mt-auto p-3 border-t border-white/10">
          <div className="flex gap-4 justify-center text-xs">
            <Link
              to="/rules"
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              Rules
            </Link>
            <span className="text-white/20">•</span>
            <Link
              to="/about"
              className="text-white/50 hover:text-white transition-colors flex items-center gap-1"
            >
              About
            </Link>
          </div>
        </div>
      </Card>
    </aside>
  );
};
