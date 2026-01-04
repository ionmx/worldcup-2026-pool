import React from 'react';
import { Link } from 'react-router-dom';
import { useLeague } from '../hooks';
import { subscribeToLeaderboard, type UserWithId } from '../services';
import { getPositionCompact } from '../utils';
import { ProfilePicture } from './ProfilePicture';

type LeaderboardProps = {
  variant?: 'compact' | 'full';
  users?: UserWithId[];
};

export const LeaderboardList = ({
  variant = 'compact',
  users: externalUsers,
}: LeaderboardProps) => {
  const { selectedLeague, leagueMemberIds } = useLeague();
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);
  const [loading, setLoading] = React.useState(!externalUsers);
  const [showTopFade, setShowTopFade] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

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
    if (externalUsers) return externalUsers;
    if (!selectedLeague || leagueMemberIds.length === 0) return allUsers;
    return allUsers.filter((user) => leagueMemberIds.includes(user.id));
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

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {isCompact && (
        <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2 px-4">
          Leaderboard
        </h3>
      )}
      <div className="relative flex-1 min-h-0">
        {/* Top fade gradient (compact only) */}
        {isCompact && (
          <div
            className={`absolute top-0 left-0 right-0 h-8 bg-linear-to-b from-black to-transparent pointer-events-none z-10 transition-opacity ${
              showTopFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`flex flex-col overflow-y-auto h-full gap-1 ${isCompact ? 'px-2 pb-6' : ''}`}
        >
          {users.map((user, index) => (
            <Link
              key={user.id}
              to={`/${user.userName}`}
              className={`flex items-center gap-2 rounded-lg hover:bg-white/5 transition-colors ${
                isCompact ? 'px-2 py-1.5' : 'px-3 py-3'
              }`}
            >
              <span
                className={`text-center ${
                  isCompact
                    ? 'w-6 text-sm'
                    : index < 3
                      ? 'w-12 text-3xl'
                      : 'w-12'
                }`}
              >
                {getPositionCompact(index + 1)}
              </span>
              <ProfilePicture
                src={user.photoURL}
                name={user.displayName}
                size={isCompact ? 'xs' : 'sm'}
              />
              <div className={`flex-1 min-w-0 ${isCompact ? '' : ''}`}>
                <div
                  className={`text-white truncate ${isCompact ? 'text-sm' : 'font-medium'}`}
                >
                  {user.displayName}
                </div>
                {!isCompact && (
                  <div className="text-white/50 text-sm">@{user.userName}</div>
                )}
              </div>
              <span
                className={`text-white/70 font-medium ${isCompact ? 'text-sm' : 'text-lg'}`}
              >
                {user.score}
                {!isCompact && (
                  <span className="text-sm font-normal"> pts</span>
                )}
              </span>
            </Link>
          ))}
        </div>
        {/* Bottom fade gradient (compact only) */}
        {isCompact && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
};
