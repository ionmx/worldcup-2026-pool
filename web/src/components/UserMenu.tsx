import React from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { ProfilePicture } from './ProfilePicture';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
} & ({ to: string } | { onClick: () => void });

const menuItemClass =
  'w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2';

export const UserMenu = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLUListElement>(null);
  const justSignedIn = React.useRef(false);

  // Navigate to user profile after sign-in
  React.useEffect(() => {
    if (justSignedIn.current && userData?.userName) {
      justSignedIn.current = false;
      void navigate(`/${userData.userName}`);
    }
  }, [userData, navigate]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        void navigate('/');
      })
      .catch(console.error);
  };

  const menuItems: MenuItem[] = [
    {
      label: 'My Predictions',
      to: `/${userData?.userName}`,
      icon: <span>⚽</span>,
    },
    {
      label: 'Edit Profile',
      to: '/edit-profile',
      icon: <span>✏️</span>,
    },
    {
      label: 'Sign Out',
      onClick: handleSignOut,
      icon: <span>👋</span>,
    },
  ];

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideButton =
        buttonRef.current && !buttonRef.current.contains(target);
      const clickedOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(target);

      if (clickedOutsideButton && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const handleSignIn = () => {
    justSignedIn.current = true;
    signInWithPopup(auth, googleProvider).catch((error) => {
      justSignedIn.current = false;
      console.error(error);
    });
  };

  // Show sign in button if not authenticated
  if (!user) {
    return (
      <Button onClick={handleSignIn} className="w-full">
        Sign In with Google
      </Button>
    );
  }

  return (
    <div ref={buttonRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-start gap-3"
      >
        <ProfilePicture
          src={userData?.photoURL}
          name={userData?.displayName}
          size="sm"
        />
        <div className="flex flex-col items-start text-left">
          <span className="text-white font-medium text-sm">
            {userData?.displayName?.split(' ')[0]}
          </span>
        </div>
      </Button>
      {isOpen && (
        <ul ref={dropdownRef} className="w-full mt-2 p-0">
          {menuItems.map((item) => (
            <li key={item.label}>
              {'to' in item ? (
                <Link
                  to={item.to}
                  onClick={closeMenu}
                  className={menuItemClass}
                >
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
      )}
    </div>
  );
};
