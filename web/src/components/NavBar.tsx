import React from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuth } from '../hooks/useAuth';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
} & ({ to: string } | { onClick: () => void });

const menuItemClass = "w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2";

export const NavBar = () => {
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
    // Add more menu items here, e.g.:
    // { label: 'Profile', to: `/${userData?.userName}`, icon: <UserIcon /> },
    // { label: 'Settings', to: '/settings', icon: <SettingsIcon /> },
    {
      label: 'Sign Out',
      onClick: handleSignOut,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
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
    <nav className="absolute top-0 left-0 right-0 flex justify-end p-4">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-black/30 hover:bg-black/50 rounded-full py-2 px-4 transition-colors cursor-pointer"
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
          <svg
            className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <ul className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 overflow-hidden">
            {menuItems.map((item) => (
              <li key={item.label}>
                {'to' in item ? (
                  <Link
                    to={item.to}
                    onClick={closeMenu}
                    className={menuItemClass}
                  >
                    {item.icon}
                    {item.label}
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
        )}
      </div>
    </nav>
  );
};
