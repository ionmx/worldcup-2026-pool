import React from 'react';
import { ProfilePicture } from './ProfilePicture';
import { getMedalOrPosition, getPositionColor } from '../utils';
import { useLeague } from '../hooks';
import {
  subscribeToLeaderboard,
  type UserData,
  type UserWithId,
} from '../services';

type UserHeaderProps = {
  userId: string;
  className?: string;
};

export const UserHeader = ({ userId, className = '' }: UserHeaderProps) => {
  const { selectedLeague, leagueMemberIds } = useLeague();
  const [user, setUser] = React.useState<UserData | null>(null);
  const [allUsers, setAllUsers] = React.useState<UserWithId[]>([]);

  // Subscribe to leaderboard to get user data
  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((users) => {
      setAllUsers(users);
      const foundUser = users.find((u) => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  // Calculate position based on selected league
  const position = React.useMemo(() => {
    if (!user) return null;

    if (selectedLeague && leagueMemberIds.length > 0) {
      // Filter to league members and find position
      const leagueUsers = allUsers.filter((u) =>
        leagueMemberIds.includes(u.id)
      );
      const idx = leagueUsers.findIndex((u) => u.id === userId);
      if (idx === -1) return null; // User not in this league
      return idx + 1;
    }

    // Global position
    const idx = allUsers.findIndex((u) => u.id === userId);
    return idx >= 0 ? idx + 1 : null;
  }, [user, userId, allUsers, selectedLeague, leagueMemberIds]);

  const positionColor = getPositionColor(position ?? 0);
  const positionText = getMedalOrPosition(position ?? 0);

  if (!user) return null;

  const isInLeague = !selectedLeague || leagueMemberIds.includes(userId);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <ProfilePicture
        src={user.photoURL}
        name={user.displayName}
        size="md"
        className="border-2 border-white/20"
      />
      <div className="flex flex-col items-start text-left flex-1">
        <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
        <div className="flex items-center gap-3 text-white/70 text-sm flex-wrap">
          <span>@{user.userName}</span>
          <span>·</span>
          <span>{user.score} pts</span>
          {position !== null && (
            <>
              <span>·</span>
              <span className={positionColor}>{positionText}</span>
              {selectedLeague && (
                <span className="text-white/40 text-xs">
                  in {selectedLeague.name}
                </span>
              )}
            </>
          )}
          {selectedLeague && !isInLeague && (
            <span className="text-white/40 text-xs italic">
              (not in {selectedLeague.name})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
