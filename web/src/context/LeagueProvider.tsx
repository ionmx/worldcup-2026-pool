import React from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '../firebase';
import { useAuth } from '../hooks';
import { subscribeToUserLeagues, subscribeToLeagueMembers } from '../services';
import type { League } from '../services';
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

      // Update selected league if it was modified, or reset if deleted
      setSelectedLeagueState((current) => {
        if (!current) return current;

        const updatedLeague = userLeagues.find((l) => l.id === current.id);
        if (!updatedLeague) {
          // League was deleted, reset to global
          setPreferredLeagueId(null);
          return null;
        }

        // Return updated league data (handles name/slug changes)
        return updatedLeague;
      });
    });

    return () => unsubscribe();
  }, [user, setSelectedLeague]);

  // Store the selected league ID for subscriptions (avoids re-subscribing on name changes)
  const selectedLeagueId = selectedLeague?.id ?? null;

  // Subscribe to league members when league is selected
  React.useEffect(() => {
    if (!selectedLeagueId) {
      setLeagueMemberIds([]);
      return;
    }

    const unsubscribe = subscribeToLeagueMembers(
      selectedLeagueId,
      (members) => {
        setLeagueMemberIds(members);
      }
    );

    return () => unsubscribe();
  }, [selectedLeagueId]);

  // Subscribe to selected league's data for real-time updates (name, image, etc.)
  React.useEffect(() => {
    if (!selectedLeagueId) return;

    const leagueRef = ref(db, `leagues/${selectedLeagueId}`);
    const unsubscribe = onValue(leagueRef, (snapshot) => {
      if (!snapshot.exists()) {
        // League was deleted
        setSelectedLeagueState(null);
        setPreferredLeagueId(null);
        return;
      }

      const leagueData = snapshot.val() as League;

      // Update selectedLeague with fresh data
      setSelectedLeagueState((current) => {
        if (!current) return current;
        return {
          ...current,
          ...leagueData,
        };
      });

      // Also update the leagues array to keep dropdown in sync
      setLeagues((currentLeagues) =>
        currentLeagues.map((league) =>
          league.id === selectedLeagueId ? { ...league, ...leagueData } : league
        )
      );
    });

    return () => unsubscribe();
  }, [selectedLeagueId]);

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
