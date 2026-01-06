import React from 'react';
import { Link } from 'react-router-dom';
import { useLeague } from '../hooks';
import { subscribeToLeaderboard, type UserWithId } from '../services';
import { getPositionCompact } from '../utils';
import { Card } from './Card';
import { LeaguePicture } from './LeaguePicture';
import { Podium } from './Podium';
import { ProfilePicture } from './ProfilePicture';
import appIcon from '/app-icon.png';

type LeaderboardProps = {
  variant?: 'compact' | 'full';
  users?: UserWithId[];
};

export const LeaderboardList = ({
  variant = 'compact',
  users: externalUsers,
}: LeaderboardProps) => {
  const { leagues, selectedLeague, setSelectedLeague, leagueMemberIds } =
    useLeague();
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);
  const [loading, setLoading] = React.useState(!externalUsers);
  const [showTopFade, setShowTopFade] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Subscribe to global leaderboard
  React.useEffect(() => {
    if (externalUsers) return;

    const unsubscribe = subscribeToLeaderboard((data) => {
      setAllUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [externalUsers]);

  // Filter users by league if selected
  const users = React.useMemo(() => {
    let baseUsers: UserWithId[];
    if (externalUsers) {
      baseUsers = externalUsers;
    } else if (!selectedLeague || leagueMemberIds.length === 0) {
      baseUsers = allUsers;
    } else {
      baseUsers = allUsers.filter((user) => leagueMemberIds.includes(user.id));
    }

    // TODO: Remove mock users after testing
    const mockUsers = Array.from({ length: 20 }, (_, i) => ({
      id: `mock-${i}`,
      userName: `testuser${i + 1}`,
      displayName: `Test User ${i + 1}`,
      email: `test${i + 1}@example.com`,
      photoURL: '',
      score: Math.max(0, 100 - (baseUsers.length + i) * 3),
      admin: false,
    })) as UserWithId[];

    return [...baseUsers, ...mockUsers];
  }, [externalUsers, selectedLeague, leagueMemberIds, allUsers]);

  const handleScroll = () => {
    if (scrollRef.current) {
      setShowTopFade(scrollRef.current.scrollTop > 10);
    }
  };

  if (loading) {
    return (
      <div className="text-white/50 text-sm text-center py-4">Loading...</div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-white/50 text-sm text-center py-4">
        No players yet
      </div>
    );
  }

  const isCompact = variant === 'compact';

  // Split users for podium display (full variant only)
  const podiumUsers = !isCompact && users.length >= 3 ? users.slice(0, 3) : [];
  const restUsers = !isCompact && users.length >= 3 ? users.slice(3) : users;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {isCompact &&
        (leagues.length > 0 ? (
          <div ref={dropdownRef} className="relative px-4 mb-2">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between text-white/70 text-xs font-medium uppercase tracking-wider hover:text-white transition-colors"
            >
              {selectedLeague ? selectedLeague.name : 'Leaderboard'}
              <span
                className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                ▼
              </span>
            </button>
            {dropdownOpen && (
              <ul className="absolute top-full left-2 right-2 mt-1 bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg overflow-hidden z-20">
                <li>
                  <button
                    onClick={() => {
                      setSelectedLeague(null);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2 ${!selectedLeague ? 'text-white bg-white/5' : 'text-white/70'}`}
                  >
                    <img
                      src={appIcon}
                      alt="Global"
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <span className="flex-1 truncate">FIFA WC 2026 POOL</span>
                    {!selectedLeague && <span className="ml-auto">✓</span>}
                  </button>
                </li>
                {leagues.map((league) => (
                  <li key={league.id}>
                    <button
                      onClick={() => {
                        setSelectedLeague(league);
                        setDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 transition-colors flex items-center gap-2 ${selectedLeague?.id === league.id ? 'text-white bg-white/5' : 'text-white/70'}`}
                    >
                      <LeaguePicture
                        src={league.imageURL}
                        name={league.name}
                        size="sm"
                        className="w-6 h-6"
                      />
                      <span className="flex-1 truncate">{league.name}</span>
                      {selectedLeague?.id === league.id && (
                        <span className="ml-auto">✓</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2 px-4">
            Leaderboard
          </h3>
        ))}
      {/* Podium for full variant */}
      {!isCompact && <Podium users={podiumUsers} />}

      {/* User list - wrapped in Card for full variant */}
      {isCompact ? (
        <div className="relative flex-1 min-h-0">
          <div
            className={`absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-black to-transparent pointer-events-none z-10 transition-opacity ${
              showTopFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex flex-col overflow-y-auto h-full gap-1 px-2 pb-6"
          >
            {users.map((user, index) => (
              <Link
                key={user.id}
                to={`/${user.userName}`}
                className="flex items-center gap-2 rounded-lg hover:bg-white/5 transition-colors px-2 py-1.5"
              >
                <span className="w-6 text-sm text-center">
                  {getPositionCompact(index + 1)}
                </span>
                <ProfilePicture
                  src={user.photoURL}
                  name={user.displayName}
                  size="xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate text-sm">
                    {user.displayName}
                  </div>
                </div>
                <span className="text-white/70 font-medium text-sm">
                  {user.score}
                </span>
              </Link>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black to-transparent pointer-events-none" />
        </div>
      ) : (
        <Card className="p-4">
          <div className="flex flex-col gap-1">
            {restUsers.map((user, index) => {
              const position = users.length >= 3 ? index + 4 : index + 1;
              return (
                <Link
                  key={user.id}
                  to={`/${user.userName}`}
                  className="flex items-center gap-2 rounded-lg hover:bg-white/5 transition-colors px-3 py-3"
                >
                  <span className="w-12 text-center">
                    {getPositionCompact(position)}
                  </span>
                  <ProfilePicture
                    src={user.photoURL}
                    name={user.displayName}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate font-medium">
                      {user.displayName}
                    </div>
                    <div className="text-white/50 text-sm">
                      @{user.userName}
                    </div>
                  </div>
                  <span className="text-white/70 font-medium text-lg">
                    {user.score}
                    <span className="text-sm font-normal"> pts</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
