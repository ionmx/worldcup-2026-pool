import { worldcupLogo } from '../assets';
import { UserMenu } from './UserMenu';

export const NavBar = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 flex items-start justify-between p-4">
      <div className="flex items-center gap-3">
        <img src={worldcupLogo} alt="World Cup 2026" className="h-10" />
        <span className="text-white font-light text-lg">FIFA WORLD CUP 2026 POOL</span>
      </div>
      <UserMenu />
    </nav>
  );
};
