import React from 'react';
import { useAuth } from '../hooks';
import { subscribeToUserLeagues, subscribeToLeagueMembers } from '../services';
import { LeagueContext, type LeagueContextType } from './LeagueContext';
import { getPendingSelectedLeague, clearPendingSelectedLeague } from './AuthProvider';

export const LeagueProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [leagues, setLeagues] = React.useState<LeagueContextType['leagues']>(
    []
  );
  const [selectedLeague, setSelectedLeague] =
    React.useState<LeagueContextType['selectedLeague']>(null);
  const [leagueMemberIds, setLeagueMemberIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Subscribe to user's leagues
  React.useEffect(() => {
    if (!user) {
      setLeagues([]);
      setSelectedLeague(null);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserLeagues(user.uid, (userLeagues) => {
      setLeagues(userLeagues);
      setLoading(false);

      // Check for pending selected league (from join flow)
      const pendingLeagueId = getPendingSelectedLeague();
      if (pendingLeagueId) {
        const pendingLeague = userLeagues.find((l) => l.id === pendingLeagueId);
        if (pendingLeague) {
          setSelectedLeague(pendingLeague);
        }
        clearPendingSelectedLeague();
      }

      // If selected league no longer exists, reset to global
      if (
        selectedLeague &&
        !userLeagues.find((l) => l.id === selectedLeague.id)
      ) {
        setSelectedLeague(null);
      }
    });

    return () => unsubscribe();
  }, [user, selectedLeague]);

  // Subscribe to league members when league is selected
  React.useEffect(() => {
    if (!selectedLeague) {
      setLeagueMemberIds([]);
      return;
    }

    const unsubscribe = subscribeToLeagueMembers(selectedLeague.id, (members) => {
      setLeagueMemberIds(members);
    });

    return () => unsubscribe();
  }, [selectedLeague]);

  return (
    <LeagueContext
      value={{
        leagues,
        selectedLeague,
        setSelectedLeague,
        leagueMemberIds,
        loading,
      }}
    >
      {children}
    </LeagueContext>
  );
};
