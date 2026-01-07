import React from 'react';
import { useAuth } from '../hooks';
import { subscribeToUserLeagues, subscribeToLeagueMembers } from '../services';
import { LeagueContext, type LeagueContextType } from './LeagueContext';
import {
  getPendingSelectedLeague,
  clearPendingSelectedLeague,
} from './AuthProvider';

const PREFERRED_LEAGUE_KEY = 'preferredLeagueId';

const getPreferredLeagueId = (): string | null => {
  try {
    return localStorage.getItem(PREFERRED_LEAGUE_KEY);
  } catch {
    return null;
  }
};

const setPreferredLeagueId = (leagueId: string | null): void => {
  try {
    if (leagueId) {
      localStorage.setItem(PREFERRED_LEAGUE_KEY, leagueId);
    } else {
      localStorage.removeItem(PREFERRED_LEAGUE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
};

export const LeagueProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [leagues, setLeagues] = React.useState<LeagueContextType['leagues']>(
    []
  );
  const [selectedLeague, setSelectedLeagueState] =
    React.useState<LeagueContextType['selectedLeague']>(null);
  const [leagueMemberIds, setLeagueMemberIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const hasRestoredRef = React.useRef(false);

  // Wrapper to persist selection to localStorage
  const setSelectedLeague = React.useCallback(
    (league: LeagueContextType['selectedLeague']) => {
      setSelectedLeagueState(league);
      setPreferredLeagueId(league?.id ?? null);
    },
    []
  );

  // Subscribe to user's leagues
  React.useEffect(() => {
    if (!user) {
      setLeagues([]);
      setSelectedLeagueState(null);
      setLoading(false);
      hasRestoredRef.current = false;
      return;
    }

    const unsubscribe = subscribeToUserLeagues(user.uid, (userLeagues) => {
      setLeagues(userLeagues);
      setLoading(false);

      // Check for pending selected league (from join flow) - highest priority
      const pendingLeagueId = getPendingSelectedLeague();
      if (pendingLeagueId) {
        const pendingLeague = userLeagues.find((l) => l.id === pendingLeagueId);
        if (pendingLeague) {
          setSelectedLeague(pendingLeague);
        }
        clearPendingSelectedLeague();
        hasRestoredRef.current = true;
        return;
      }

      // Restore from localStorage on first load (if not already restored)
      if (!hasRestoredRef.current) {
        hasRestoredRef.current = true;
        const preferredId = getPreferredLeagueId();
        if (preferredId) {
          const preferredLeague = userLeagues.find((l) => l.id === preferredId);
          if (preferredLeague) {
            setSelectedLeagueState(preferredLeague);
            return;
          }
          // League not found, clear invalid preference
          setPreferredLeagueId(null);
        }
      }

      // If selected league no longer exists, reset to global
      setSelectedLeagueState((current) => {
        if (current && !userLeagues.find((l) => l.id === current.id)) {
          setPreferredLeagueId(null);
          return null;
        }
        return current;
      });
    });

    return () => unsubscribe();
  }, [user, setSelectedLeague]);

  // Subscribe to league members when league is selected
  React.useEffect(() => {
    if (!selectedLeague) {
      setLeagueMemberIds([]);
      return;
    }

    const unsubscribe = subscribeToLeagueMembers(
      selectedLeague.id,
      (members) => {
        setLeagueMemberIds(members);
      }
    );

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
