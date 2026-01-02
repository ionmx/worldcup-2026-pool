import React from 'react';
import { Link } from 'react-router-dom';
import { subscribeToLeaderboard, type UserWithId } from '../services';
import { getPositionCompact } from '../utils';

export const Leaderboard = () => {
  const [users, setUsers] = React.useState<UserWithId[]>([]);

  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard(setUsers);
    return () => unsubscribe();
  }, []);

  if (users.length === 0) {
    return (
      <div className="text-white/50 text-sm text-center py-4">
        No players yet
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <h3 className="text-white/70 text-xs font-medium uppercase tracking-wider mb-2">
        Leaderboard
      </h3>
      <div className="relative flex-1 min-h-0">
        <div className="flex flex-col gap-1 overflow-y-auto h-full pb-6">
          {users.map((user, index) => (
            <Link
              key={user.id}
              to={`/${user.userName}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="w-6 text-center text-sm">
                {getPositionCompact(index + 1)}
              </span>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                  {user.displayName?.charAt(0) ?? '?'}
                </div>
              )}
              <span className="flex-1 text-sm text-white truncate">
                {user.displayName}
              </span>
              <span className="text-sm text-white/70 font-medium">
                {user.score}
              </span>
            </Link>
          ))}
        </div>
        {/* Fade gradient to indicate more content */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-black to-transparent pointer-events-none" />
      </div>
    </div>
  );
};
