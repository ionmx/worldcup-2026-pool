import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, Card, ProfilePicture } from '../components';
import { subscribeToLeaderboard, type UserWithId } from '../services';
import { getMedalOrPosition } from '../utils';

export const Leaderboard = () => {
  const [users, setUsers] = React.useState<UserWithId[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

        {loading ? (
          <div className="text-center text-white/70 py-10">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center text-white/50 py-10">No players yet</div>
        ) : (
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              {users.map((user, index) => (
                <Link
                  key={user.id}
                  to={`/${user.userName}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="w-10 text-center text-lg">
                    {getMedalOrPosition(index + 1)}
                  </span>
                  <ProfilePicture
                    src={user.photoURL}
                    name={user.displayName}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {user.displayName}
                    </div>
                    <div className="text-white/50 text-sm">
                      @{user.userName}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white/80">
                    {user.score}{' '}
                    <span className="text-sm font-normal">pts</span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};
