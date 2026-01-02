import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout, MatchesByDay, MatchesByGroup, Button } from '../components';
import { useMatches, useAuth } from '../hooks';
import {
  type UserData,
  type UserPredictions,
  subscribeToPredictions,
  subscribeToLeaderboard,
  getUserByUsername,
} from '../services';
import { getMedalOrPosition } from '../utils';

type ViewMode = 'day' | 'group';

export const UserProfile = () => {
  const { userName } = useParams();
  const { matches, loading, error } = useMatches();
  const { user, userData } = useAuth();
  const [viewMode, setViewMode] = React.useState<ViewMode>('day');
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const [profileUserId, setProfileUserId] = React.useState<string | null>(null);
  const [profileData, setProfileData] = React.useState<UserData | null>(null);
  const [leaderboardPosition, setLeaderboardPosition] = React.useState<
    number | null
  >(null);

  // Determine if viewing own profile
  const isOwnProfile = userData?.userName === userName;

  // Get the user ID and data for the profile being viewed
  React.useEffect(() => {
    if (isOwnProfile && user && userData) {
      setProfileUserId(user.uid);
      setProfileData(userData);
    } else if (userName) {
      // Fetch the user ID by username for viewing others' profiles
      getUserByUsername(userName)
        .then((profileUser) => {
          setProfileUserId(profileUser?.id ?? null);
          setProfileData(profileUser?.data ?? null);
        })
        .catch(console.error);
    }
  }, [userName, isOwnProfile, user, userData]);

  // Subscribe to predictions for the profile being viewed
  React.useEffect(() => {
    if (!profileUserId) return;

    const unsubscribe = subscribeToPredictions(profileUserId, setPredictions);
    return () => unsubscribe();
  }, [profileUserId]);

  // Subscribe to leaderboard to get position
  React.useEffect(() => {
    if (!profileUserId) return;

    const unsubscribe = subscribeToLeaderboard((users) => {
      const position = users.findIndex((u) => u.id === profileUserId);
      setLeaderboardPosition(position >= 0 ? position + 1 : null);
      // Also update profileData with latest score
      const currentUser = users.find((u) => u.id === profileUserId);
      if (currentUser) {
        setProfileData((prev) =>
          prev ? { ...prev, score: currentUser.score } : null
        );
      }
    });
    return () => unsubscribe();
  }, [profileUserId]);

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        {/* User Header */}
        {profileData && (
          <div className="flex items-center gap-4 mb-8">
            {profileData.photoURL ? (
              <img
                src={profileData.photoURL}
                alt={profileData.displayName}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold border-2 border-white/20">
                {profileData.displayName?.charAt(0) ?? '?'}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">
                {profileData.displayName}
              </h1>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <span>@{profileData.userName}</span>
                <span>·</span>
                <span>{profileData.score} pts</span>
                {leaderboardPosition && (
                  <>
                    <span>·</span>
                    <span className="text-yellow-400">
                      {getMedalOrPosition(leaderboardPosition)} place
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <h2 className="text-xl font-semibold text-white/80">Matches</h2>

          {/* View Toggle */}
          <div className="flex justify-center gap-2">
            <Button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-full transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-black!'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              By Day
            </Button>
            <Button
              onClick={() => setViewMode('group')}
              className={`px-4 py-2 rounded-full transition-colors ${
                viewMode === 'group'
                  ? 'bg-white text-black!'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              By Group
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center text-white/70">Loading matches...</div>
        )}

        {error && (
          <div className="text-center text-red-400">Error: {error}</div>
        )}

        {matches &&
          (viewMode === 'day' ? (
            <MatchesByDay
              matches={matches}
              isOwnProfile={isOwnProfile}
              userId={profileUserId ?? undefined}
              predictions={predictions}
            />
          ) : (
            <MatchesByGroup
              matches={matches}
              isOwnProfile={isOwnProfile}
              userId={profileUserId ?? undefined}
              predictions={predictions}
            />
          ))}
      </div>
    </AppLayout>
  );
};
