import React from 'react';
import { ProfilePicture } from './ProfilePicture';
import { getMedalOrPosition, getPositionColor } from '../utils';
import { subscribeToLeaderboard, type UserData } from '../services';

type UserHeaderProps = {
  userId: string;
  variant?: 'full' | 'compact';
  className?: string;
};

export const UserHeader = ({
  userId,
  variant = 'full',
  className = '',
}: UserHeaderProps) => {
  const [user, setUser] = React.useState<UserData | null>(null);
  const [position, setPosition] = React.useState<number | null>(null);

  // Subscribe to leaderboard to get user data and position
  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((users) => {
      const idx = users.findIndex((u) => u.id === userId);
      if (idx >= 0) {
        setUser(users[idx]);
        setPosition(idx + 1);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const positionColor = getPositionColor(position ?? 0);
  const positionText = getMedalOrPosition(position ?? 0);

  if (!user) return null;

  const isCompact = variant === 'compact';

  return (
    <div
      className={`flex items-center ${isCompact ? 'gap-3' : 'gap-4'} ${className}`}
    >
      <ProfilePicture
        src={user.photoURL}
        name={user.displayName}
        size={isCompact ? 'sm' : 'md'}
        className={isCompact ? '' : 'border-2 border-white/20'}
      />
      <div
        className={`flex flex-col items-start text-left ${isCompact ? 'flex-1 min-w-0' : 'flex-1'}`}
      >
        {isCompact ? (
          <span className="text-white font-medium text-sm truncate max-w-full pb-1">
            {user.displayName}
          </span>
        ) : (
          <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
        )}
        {isCompact ? (
          <div className="flex items-center gap-1.5 text-white/50 text-xs">
            <span>{user.score} pts</span>
            {position !== null && (
              <>
                <span>·</span>
                <span className={positionColor}>{positionText}</span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 text-white/70 text-sm">
            <span>@{user.userName}</span>
            <span>·</span>
            <span>{user.score} pts</span>
            {position !== null && (
              <>
                <span>·</span>
                <span className={positionColor}>{positionText}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
