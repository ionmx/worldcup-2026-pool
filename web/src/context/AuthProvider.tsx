import React from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { handleUserLogin, joinLeague, isLeagueMember, type UserData } from '../services';
import { AuthContext } from './AuthContext';

// Join intent storage key and helpers
const JOIN_INTENT_KEY = 'pendingJoinLeague';

type JoinIntent = {
  leagueId: string;
  slug: string;
  inviteCode: string;
};

const getJoinIntent = (): JoinIntent | null => {
  const stored = localStorage.getItem(JOIN_INTENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as JoinIntent;
  } catch {
    return null;
  }
};

const clearJoinIntent = (): void => {
  localStorage.removeItem(JOIN_INTENT_KEY);
};

// Store league ID to select after join
const PENDING_LEAGUE_KEY = 'pendingSelectedLeague';

export const setPendingSelectedLeague = (leagueId: string): void => {
  localStorage.setItem(PENDING_LEAGUE_KEY, leagueId);
};

export const getPendingSelectedLeague = (): string | null => {
  return localStorage.getItem(PENDING_LEAGUE_KEY);
};

export const clearPendingSelectedLeague = (): void => {
  localStorage.removeItem(PENDING_LEAGUE_KEY);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [userData, setUserData] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        handleUserLogin(currentUser)
          .then(async (data) => {
            setUserData(data);

            // Check for pending join intent
            const joinIntent = getJoinIntent();
            if (joinIntent) {
              try {
                const alreadyMember = await isLeagueMember(
                  joinIntent.leagueId,
                  currentUser.uid
                );
                if (!alreadyMember) {
                  await joinLeague(joinIntent.leagueId, currentUser.uid);
                }
                // Store league ID to be selected after redirect
                setPendingSelectedLeague(joinIntent.leagueId);
                // Redirect to the league page
                window.location.href = `/league/${joinIntent.slug}`;
              } catch (err) {
                console.error('Error processing join intent:', err);
              } finally {
                clearJoinIntent();
              }
            }
          })
          .catch((error: unknown) => {
            console.error('Error fetching user data:', error);
            setUserData(null);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userData,
    loading,
    setUserData,
  };

  return <AuthContext value={value}>{!loading && children}</AuthContext>;
};
