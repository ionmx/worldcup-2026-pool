import { Link } from 'react-router-dom';
import { Card } from './Card';
import { LeaderboardList } from './LeaderboardList';
import { SidebarMenu } from './SidebarMenu';

export const Sidebar = () => {
  return (
    <aside className="w-80 shrink-0 p-4 h-screen sticky top-0">
      <Card className="h-full max-h-[calc(100vh-2rem)] flex flex-col rounded-xl after:hidden overflow-hidden">
        <SidebarMenu />
        <div className="pt-4 border-t border-white/10 flex-1 min-h-0 flex flex-col">
          <LeaderboardList />
        </div>
        {/* Footer Links */}
        <div className="mt-auto pt-4 border-t border-white/10 px-4 pb-4">
          <div className="flex gap-4 justify-center text-sm">
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
