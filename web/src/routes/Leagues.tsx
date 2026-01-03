import React from 'react';
import { Link } from 'react-router-dom';
import { AppLayout, Card, Button } from '../components';
import { useAuth } from '../hooks';
import {
  subscribeToUserLeagues,
  createLeague,
  joinLeague,
  getLeagueByInviteCode,
  type LeagueWithId,
} from '../services';

export const Leagues = () => {
  const { user } = useAuth();
  const [leagues, setLeagues] = React.useState<LeagueWithId[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showJoin, setShowJoin] = React.useState(false);
  const [newLeagueName, setNewLeagueName] = React.useState('');
  const [inviteCode, setInviteCode] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [joining, setJoining] = React.useState(false);

  React.useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToUserLeagues(user.uid, (userLeagues) => {
      setLeagues(userLeagues);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newLeagueName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      await createLeague(newLeagueName.trim(), user.uid);
      setNewLeagueName('');
      setShowCreate(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create league');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinLeague = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;

    setJoining(true);
    setError(null);

    try {
      const league = await getLeagueByInviteCode(inviteCode.trim());
      if (!league) {
        setError('Invalid invite code');
        return;
      }

      await joinLeague(league.id, user.uid);
      setInviteCode('');
      setShowJoin(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join league');
    } finally {
      setJoining(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors';

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">My Leagues</h1>
          {user && (
            <div className="flex gap-2">
              <Button onClick={() => setShowJoin(true)} className="text-sm">
                Join
              </Button>
              <Button onClick={() => setShowCreate(true)} className="text-sm">
                Create
              </Button>
            </div>
          )}
        </div>

        {!user && (
          <Card className="p-6 text-center">
            <p className="text-white/70">Sign in to create or join leagues</p>
          </Card>
        )}

        {/* Create League Modal */}
        {showCreate && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Create New League
            </h2>
            <form onSubmit={(e) => void handleCreateLeague(e)}>
              <input
                type="text"
                value={newLeagueName}
                onChange={(e) => setNewLeagueName(e.target.value)}
                placeholder="League name"
                className={inputClass}
                autoFocus
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creating || !newLeagueName.trim()}
                  className="flex-1"
                >
                  {creating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Join League Modal */}
        {showJoin && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Join League
            </h2>
            <form onSubmit={(e) => void handleJoinLeague(e)}>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                className={`${inputClass} uppercase tracking-widest text-center font-mono`}
                maxLength={6}
                autoFocus
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              <div className="flex gap-3 mt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowJoin(false);
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={joining || inviteCode.length < 6}
                  className="flex-1"
                >
                  {joining ? 'Joining...' : 'Join'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Leagues List */}
        {loading ? (
          <div className="text-center text-white/70 py-20">Loading...</div>
        ) : leagues.length === 0 && user ? (
          <Card className="p-6 text-center">
            <p className="text-white/70 mb-4">
              You haven't joined any leagues yet
            </p>
            <p className="text-white/50 text-sm">
              Create your own league or join one with an invite code
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {leagues.map((league) => (
              <Link key={league.id} to={`/league/${league.slug}`}>
                <Card className="p-4 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {league.name}
                      </h3>
                      <p className="text-white/50 text-sm">
                        {league.memberCount}{' '}
                        {league.memberCount === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    <span className="text-white/30">→</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
