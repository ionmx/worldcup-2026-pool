import React from 'react';
import { useParams } from 'react-router-dom';
import {
  PageContainer,
  NavBar,
  MatchesByDay,
  MatchesByGroup,
  Button,
} from '../components';
import { useMatches, useAuth } from '../hooks';
import {
  type UserPredictions,
  subscribeToPredictions,
  getUserByUsername,
} from '../services';

type ViewMode = 'day' | 'group';

export const UserProfile = () => {
  const { userName } = useParams();
  const { matches, loading, error } = useMatches();
  const { user, userData } = useAuth();
  const [viewMode, setViewMode] = React.useState<ViewMode>('day');
  const [predictions, setPredictions] = React.useState<UserPredictions>({});
  const [profileUserId, setProfileUserId] = React.useState<string | null>(null);

  // Determine if viewing own profile
  const isOwnProfile = userData?.userName === userName;

  // Get the user ID for the profile being viewed
  React.useEffect(() => {
    if (isOwnProfile && user) {
      setProfileUserId(user.uid);
    } else if (userName) {
      // Fetch the user ID by username for viewing others' profiles
      getUserByUsername(userName)
        .then((profileUser) => {
          setProfileUserId(profileUser?.id ?? null);
        })
        .catch(console.error);
    }
  }, [userName, isOwnProfile, user]);

  // Subscribe to predictions for the profile being viewed
  React.useEffect(() => {
    if (!profileUserId) return;

    const unsubscribe = subscribeToPredictions(profileUserId, setPredictions);
    return () => unsubscribe();
  }, [profileUserId]);

  return (
    <PageContainer className="relative">
      <NavBar />
      <div className="pt-20 px-4 pb-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-3xl font-bold mb-6 text-center">Matches</h1>

          {/* View Toggle */}
          <div className="flex justify-center gap-2 mb-6">
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
    </PageContainer>
  );
};
