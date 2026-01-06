import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { bgImage, worldcupLogo } from '../assets';
import { AppLayout, Button, Card, LeaguePicture } from '../components';
import { useAuth, useLeague } from '../hooks';
import {
  getLeagueBySlug,
  joinLeague,
  isLeagueMember,
  type LeagueWithId,
} from '../services';

// Storage key for pending join intent
const JOIN_INTENT_KEY = 'pendingJoinLeague';

type JoinIntent = {
  leagueId: string;
  slug: string;
  inviteCode: string;
};

// Helper functions for localStorage
const setJoinIntent = (intent: JoinIntent): void => {
  localStorage.setItem(JOIN_INTENT_KEY, JSON.stringify(intent));
};

const clearJoinIntent = (): void => {
  localStorage.removeItem(JOIN_INTENT_KEY);
};

export const JoinLeague = () => {
  const { slug, inviteCode } = useParams<{
    slug: string;
    inviteCode: string;
  }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { setSelectedLeague } = useLeague();

  const [league, setLeague] = React.useState<LeagueWithId | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [joining, setJoining] = React.useState(false);
  const [signingIn, setSigningIn] = React.useState(false);

  // Hide splash screen when ready
  React.useEffect(() => {
    if (!loading && !authLoading) {
      window.hideSplash?.();
    }
  }, [loading, authLoading]);

  // Fetch league info
  React.useEffect(() => {
    if (!slug) {
      setError('Invalid link');
      setLoading(false);
      return;
    }

    getLeagueBySlug(slug)
      .then((fetchedLeague) => {
        if (!fetchedLeague) {
          setError('League not found');
        } else if (
          inviteCode?.toUpperCase() !== fetchedLeague.inviteCode.toUpperCase()
        ) {
          setError('Invalid invite code');
        } else {
          setLeague(fetchedLeague);
        }
      })
      .catch((err) => {
        console.error('Error fetching league:', err);
        setError('Failed to load league');
      })
      .finally(() => setLoading(false));
  }, [slug, inviteCode]);

  // Auto-join if user is logged in
  React.useEffect(() => {
    if (authLoading || loading || !league || !user || joining) return;

    const performJoin = async () => {
      setJoining(true);
      try {
        // Check if already a member
        const alreadyMember = await isLeagueMember(league.id, user.uid);
        if (alreadyMember) {
          // Already a member, just redirect
          setSelectedLeague(league);
          void navigate(`/league/${league.slug}`, { replace: true });
          return;
        }

        // Join the league
        await joinLeague(league.id, user.uid);
        setSelectedLeague(league);
        void navigate(`/league/${league.slug}`, { replace: true });
      } catch (err) {
        console.error('Error joining league:', err);
        setError('Failed to join league');
        setJoining(false);
      }
    };

    void performJoin();
  }, [authLoading, loading, league, user, joining, navigate]);

  const handleSignIn = () => {
    if (!league || !inviteCode) return;

    // Store join intent before signing in
    setJoinIntent({
      leagueId: league.id,
      slug: league.slug,
      inviteCode,
    });

    setSigningIn(true);
    signInWithPopup(auth, googleProvider).catch((err) => {
      console.error('Sign in error:', err);
      setSigningIn(false);
      clearJoinIntent();
    });
  };

  // Show loading state
  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white/70">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-md mx-auto">
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <h1 className="text-xl font-bold text-white mb-2">{error}</h1>
            <p className="text-white/60 mb-6">
              This invite link may be invalid or expired.
            </p>
            <Button onClick={() => void navigate('/leagues')}>
              Go to Leagues
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Show joining state for logged-in users
  if (user && league) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white/70">Joining {league.name}...</div>
        </div>
      </AppLayout>
    );
  }

  // Show sign-in prompt for non-logged-in users (no sidebar/navbar)
  if (!user && league) {
    return (
      <>
        {/* Fixed background */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: `linear-gradient(to bottom, black, transparent 30%, transparent 70%, black), url(${bgImage})`,
          }}
        />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          {/* App header */}
          <div className="flex items-center gap-3 mb-6">
            <img
              src={worldcupLogo}
              alt="FIFA World Cup 2026"
              className="h-12"
            />
            <span className="text-white font-light text-lg">
              FIFA WC 2026 POOL
            </span>
          </div>

          <Card className="p-8 text-center max-w-md w-full">
            <div className="flex justify-center mb-4">
              <LeaguePicture
                src={league.imageURL}
                name={league.name}
                size="xl"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Join {league.name}
            </h1>
            {league.description && (
              <p className="text-white/60 mb-6">{league.description}</p>
            )}
            <p className="text-white/50 text-sm mb-6">
              Sign in to join this league and compete with friends!
            </p>
            <Button
              onClick={handleSignIn}
              disabled={signingIn}
              className="w-full"
            >
              {signingIn ? 'Signing in...' : 'Sign In with Google'}
            </Button>
          </Card>
        </div>
      </>
    );
  }

  return null;
};
