import { worldcupLogo } from '../assets';
import { Card } from './Card';
import { Leaderboard } from './Leaderboard';
import { UserMenu } from './UserMenu';

export const Sidebar = () => {
  return (
    <aside className="w-80 shrink-0 p-4">
      <Card className="sticky top-4 p-4 flex flex-col rounded-xl after:hidden">
        <div className="flex items-center gap-3 mb-4">
          <img src={worldcupLogo} alt="World Cup 2026" className="h-10" />
          <span className="text-white font-light text-sm">
            FIFA WORLD CUP 2026 POOL
          </span>
        </div>
        <UserMenu />
        <div className="mt-4 pt-4 border-t border-white/10">
          <Leaderboard />
        </div>
      </Card>
    </aside>
  );
};
