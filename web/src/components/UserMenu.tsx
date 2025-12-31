import React from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { closeIcon, predictionsIcon, signOutIcon } from '../assets';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { Card } from './Card';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
} & ({ to: string } | { onClick: () => void });

const menuItemClass = "w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2";

export const UserMenu = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        void navigate('/signin');
      })
      .catch(console.error);
  };

  const menuItems: MenuItem[] = [
    { label: 'My Predictions', to: `/${userData?.userName}`, icon: <img src={predictionsIcon} alt="My Predictions" className="w-5 h-5" /> },
    {
      label: 'Sign Out',
      onClick: handleSignOut,
      icon: <img src={signOutIcon} alt="Sign Out" className="w-5 h-5" />,
    },
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <div ref={dropdownRef}>
      <div className="flex flex-col items-end">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-black/30 hover:bg-black/50 rounded-full py-2 px-4 transition-colors cursor-pointer whitespace-nowrap w-fit"
        >
          {userData?.photoURL ? (
            <img
              src={userData.photoURL}
              alt={userData.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
              {userData?.displayName?.charAt(0) ?? '?'}
            </div>
          )}
          <span className="text-white font-medium">{userData?.displayName}</span>
        </Button>

        {isOpen && (
          <div className="relative">
            <Card className="absolute right-0 top-2 w-72 overflow-hidden p-4">
              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="text-xs text-white/70">{userData?.email}</div>
                <button
                  onClick={closeMenu}
                  className="cursor-pointer"
                >
                  <img src={closeIcon} alt="Close" className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" />
                </button>
              </div>
              <div className="flex flex-col items-center gap-2 mb-8">
                <img src={userData?.photoURL} alt={userData?.displayName} className="w-16 h-16 rounded-full object-cover" />
                <div className="text-white font-medium">Hello, {userData?.displayName?.split(' ')[0]}!</div>
              </div>
              <ul className="w-full p-0 mb-2 border rounded-lg border-white/10 bg-white/5">
                {menuItems.map((item) => (
                  <li key={item.label}>
                    {'to' in item ? (
                      <Link to={item.to} onClick={closeMenu} className={menuItemClass}>
                        {item.icon} {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          item.onClick();
                          closeMenu();
                        }}
                        className={menuItemClass}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
