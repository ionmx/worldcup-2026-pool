import React from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { fetchMatches, type MatchesData } from '../services/matchService';
import { MatchContext } from './MatchContext';

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [matches, setMatches] = React.useState<MatchesData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const matchesRef = ref(db, 'matches');

    // Set up real-time listener
    const unsubscribe = onValue(
      matchesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setMatches(snapshot.val() as MatchesData);
          setLoading(false);
        } else {
          // No matches exist, fetch from API and initialize
          fetchMatches()
            .then((data) => {
              setMatches(data);
            })
            .catch((err: unknown) => {
              console.error('Error fetching matches:', err);
              setError(
                err instanceof Error ? err.message : 'Failed to load matches'
              );
            })
            .finally(() => {
              setLoading(false);
            });
        }
      },
      (err) => {
        console.error('Error listening to matches:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const value = {
    matches,
    loading,
    error,
  };

  return <MatchContext value={value}>{children}</MatchContext>;
};
