import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AppLayout,
  Card,
  Button,
  LinkButton,
  LeaderboardList,
  LeaguePicture,
} from '../components';
import { useAuth } from '../hooks';
import {
  getLeagueBySlug,
  isLeagueMember,
  leaveLeague,
  regenerateInviteCode,
  subscribeToLeaderboard,
  subscribeToLeagueMembers,
  type LeagueWithId,
  type UserWithId,
} from '../services';

export const LeagueDetail = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const [league, setLeague] = React.useState<LeagueWithId | null>(null);
  const [members, setMembers] = React.useState<UserWithId[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isMember, setIsMember] = React.useState(false);
  const [showInviteCode, setShowInviteCode] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  const isOwner = user && league?.ownerId === user.uid;

  // Load league data
  React.useEffect(() => {
    if (!slug) return;

    const loadLeague = async () => {
      setLoading(true);
      const leagueData = await getLeagueBySlug(slug);
      setLeague(leagueData);

      if (leagueData && user) {
        const memberStatus = await isLeagueMember(leagueData.id, user.uid);
        setIsMember(memberStatus);
      }

      setLoading(false);
    };

    void loadLeague();
  }, [slug, user]);

  // Subscribe to league members and leaderboard (real-time updates)
  React.useEffect(() => {
    if (!league) return;

    let memberIds: string[] = [];
    let allUsers: UserWithId[] = [];

    const updateMembers = () => {
      const leagueMembers = allUsers.filter((u) => memberIds.includes(u.id));
      setMembers(leagueMembers);
      // Update isMember status reactively
      if (user) {
        setIsMember(memberIds.includes(user.uid));
      }
    };

    // Subscribe to league members
    const unsubscribeMembers = subscribeToLeagueMembers(league.id, (ids) => {
      memberIds = ids;
      updateMembers();
    });

    // Subscribe to leaderboard
    const unsubscribeLeaderboard = subscribeToLeaderboard((users) => {
      allUsers = users;
      updateMembers();
    });

    return () => {
      unsubscribeMembers();
      unsubscribeLeaderboard();
    };
  }, [league, user]);

  const handleLeave = async () => {
    if (!league || !user || isOwner) return;

    if (!confirm('Are you sure you want to leave this league?')) return;

    setLeaving(true);
    try {
      await leaveLeague(league.id, user.uid);
      window.location.href = '/leagues';
    } catch (err) {
      console.error(err);
      setLeaving(false);
    }
  };

  const handleRegenerateCode = async () => {
    if (!league || !isOwner) return;

    if (!confirm('This will invalidate the old invite code. Continue?')) return;

    try {
      const newCode = await regenerateInviteCode(league.id);
      setLeague({ ...league, inviteCode: newCode });
    } catch (err) {
      console.error(err);
    }
  };

  const getShareableLink = () => {
    if (!league) return '';
    return `${window.location.origin}/league/${league.slug}/join/${league.inviteCode}`;
  };

  const copyShareableLink = () => {
    void navigator.clipboard.writeText(getShareableLink());
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
          <div className="text-center text-white/70 py-20">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  if (!league) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              League not found
            </h1>
            <Link to="/leagues" className="text-white/70 hover:text-white">
              ← Back to My Leagues
            </Link>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Link
              to="/leagues"
              className="text-white/50 hover:text-white text-sm"
            >
              ← My Leagues
            </Link>
            {isMember && !isOwner && (
              <Button
                onClick={() => void handleLeave()}
                disabled={leaving}
                className="text-xs"
              >
                {leaving ? 'Leaving...' : 'Leave'}
              </Button>
            )}
            {isOwner && (
              <LinkButton
                to={`/league/${league.slug}/edit`}
                className="text-xs"
              >
                Edit
              </LinkButton>
            )}
          </div>

          <div className="flex items-start gap-4 mt-2">
            <LeaguePicture src={league.imageURL} name={league.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">{league.name}</h1>
              </div>
              {league.description && (
                <p className="text-white/70 mt-2">{league.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invite Section (owner only) */}
        {isOwner && (
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Invite Friends</h3>
                <p className="text-white/50 text-sm">
                  Share this link to invite others
                </p>
              </div>
              <Button
                onClick={() => setShowInviteCode(!showInviteCode)}
                className={`text-xs ${showInviteCode ? 'border-0' : ''}`}
              >
                {showInviteCode ? '✕' : 'Show Link'}
              </Button>
            </div>
            {showInviteCode && (
              <div className="mt-4 space-y-3">
                {/* Shareable Link */}
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-white/10 px-4 py-3 rounded-lg text-sm font-mono text-white/70 truncate">
                    {getShareableLink()}
                  </code>
                  <Button onClick={copyShareableLink} className="text-sm">
                    Copy
                  </Button>
                </div>
                {/* Invite Code */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-white/50 text-sm">
                    Code:{' '}
                    <span className="font-mono text-white">
                      {league.inviteCode}
                    </span>
                  </span>
                  {isOwner && (
                    <Button
                      onClick={() => void handleRegenerateCode()}
                      className="text-sm"
                    >
                      Regenerate
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Leaderboard */}
        {members.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Leaderboard</h3>
              <span className="text-white/50 text-sm">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </span>
            </div>
            <LeaderboardList variant="full" users={members} />
          </Card>
        )}
      </div>
    </AppLayout>
  );
};
