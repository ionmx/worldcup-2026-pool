import { Link } from 'react-router-dom';
import { worldcupLogo, sidebarMenuBg } from '../assets';
import { UserMenu } from './UserMenu';

export const SidebarMenu = () => {
  return (
    <div className="relative w-full flex flex-col overflow-hidden">
      <img
        src={sidebarMenuBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <Link
        to="/"
        className="relative z-10 flex items-center justify-center py-6 hover:opacity-90 transition-opacity"
      >
        <img
          src={worldcupLogo}
          alt="World Cup 2026"
          className="h-32 drop-shadow-lg"
        />
      </Link>
      <div className="relative z-10 px-2 pb-2">
        <UserMenu />
      </div>
    </div>
  );
};
