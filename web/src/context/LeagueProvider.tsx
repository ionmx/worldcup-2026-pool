import React from 'react';
import { useAuth } from '../hooks';
import { subscribeToUserLeagues, getLeagueMembers } from '../services';
import { LeagueContext, type LeagueContextType } from './LeagueContext';

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

  // Load league members when league is selected
  React.useEffect(() => {
    if (!selectedLeague) {
      setLeagueMemberIds([]);
      return;
    }

    const loadMembers = async () => {
      const members = await getLeagueMembers(selectedLeague.id);
      setLeagueMemberIds(members);
    };

    void loadMembers();
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
