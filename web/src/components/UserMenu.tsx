import React from 'react';
import { createPortal } from 'react-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebase';
import { sidebarMenuBg } from '../assets';
import { useAuth } from '../hooks/useAuth';
import { useLeague } from '../hooks/useLeague';
import { subscribeToLeaderboard, type UserWithId } from '../services';
import { getPositionCompact } from '../utils';
import { Button } from './Button';
import { ProfilePicture } from './ProfilePicture';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
} & ({ to: string } | { onClick: () => void });

const menuItemClass =
  'w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2 rounded-lg text-sm';

type UserMenuProps = {
  mobile?: boolean;
};

export const UserMenu = ({ mobile = false }: UserMenuProps) => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const { selectedLeague, leagueMemberIds } = useLeague();
  const [isOpen, setIsOpen] = React.useState(false);
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);
  const buttonRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLUListElement>(null);
  const justSignedIn = React.useRef(false);

  // Subscribe to leaderboard
  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((users) => {
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // Calculate position based on selected league
  const position = React.useMemo(() => {
    if (!user) return null;

    if (selectedLeague && leagueMemberIds.length > 0) {
      const leagueUsers = allUsers.filter((u) =>
        leagueMemberIds.includes(u.id)
      );
      const idx = leagueUsers.findIndex((u) => u.id === user.uid);
      if (idx === -1) return null;
      return idx + 1;
    }

    const idx = allUsers.findIndex((u) => u.id === user.uid);
    return idx >= 0 ? idx + 1 : null;
  }, [user, allUsers, selectedLeague, leagueMemberIds]);

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
      <Button onClick={handleSignIn} className={mobile ? 'text-xs' : 'w-full'}>
        {mobile ? 'Sign In' : 'Sign In with Google'}
      </Button>
    );
  }
  console.log({ user });
  return (
    <div ref={buttonRef} className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center ${mobile ? 'p-0!' : `w-full gap-3 justify-start px-3! p-2! border border-white/10 bg-black/20 backdrop-blur-sm ${isOpen ? 'rounded-t-xl rounded-b-none' : 'rounded-xl'}`}`}
      >
        {!mobile && userData && (
          <>
            <ProfilePicture
              src={userData.photoURL}
              name={userData.displayName}
              size="md"
              className="border-0 rounded-lg"
            />
            {[
              { label: 'Score', value: userData.score, show: true },
              {
                label: 'Rank',
                value: getPositionCompact(position!),
                show: position !== null,
              },
            ]
              .filter((item) => item.show)
              .map((item) => (
                <div
                  key={item.label}
                  className="relative aspect-square h-16 flex flex-col items-center justify-center rounded-lg overflow-hidden"
                >
                  <div
                    className="absolute inset-0 scale-[-1] opacity-70"
                    style={{
                      backgroundImage: `url(${sidebarMenuBg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <span className="relative text-white/60 text-[10px] uppercase tracking-wider">
                    {item.label}
                  </span>
                  <span className="relative text-white font-semibold text-xl">
                    {item.value}
                  </span>
                </div>
              ))}
            <span
              className={`ml-auto text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            >
              ▼
            </span>
          </>
        )}
        {mobile && userData && (
          <ProfilePicture
            src={userData.photoURL}
            name={userData.displayName}
            size="sm"
            className="border-2 border-white/20"
          />
        )}
      </Button>
      {isOpen &&
        (mobile ? (
          createPortal(
            <ul
              ref={dropdownRef}
              className="p-0 fixed left-0 right-0 bg-black/80 backdrop-blur-lg border-b border-white/10 shadow-xl z-50"
              style={{ top: 'calc(env(safe-area-inset-top) + 57px)' }}
            >
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
            </ul>,
            document.body
          )
        ) : (
          <ul
            ref={dropdownRef}
            className="p-0 w-full backdrop-blur-2xl bg-black/20 border border-white/10 border-t-0 rounded-b-xl"
          >
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
        ))}
    </div>
  );
};
