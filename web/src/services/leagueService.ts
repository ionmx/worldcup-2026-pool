import { db } from '../firebase';
import {
  ref,
  get,
  set,
  push,
  update,
  remove,
  onValue,
  type Unsubscribe,
} from 'firebase/database';

export interface League {
  name: string;
  slug: string;
  ownerId: string;
  inviteCode: string;
  createdAt: number;
}

export interface LeagueWithId extends League {
  id: string;
  memberCount?: number;
}

/**
 * Generate a random invite code
 */
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate a URL-safe slug from a name
 */
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

/**
 * Check if a slug is available
 */
export const checkSlugAvailable = async (slug: string): Promise<boolean> => {
  const slugRef = ref(db, `leagueSlugs/${slug}`);
  const snapshot = await get(slugRef);
  return !snapshot.exists();
};

/**
 * Create a new league
 */
export const createLeague = async (
  name: string,
  ownerId: string
): Promise<LeagueWithId> => {
  // Generate slug and ensure it's unique
  let slug = generateSlug(name);
  let suffix = 0;
  while (!(await checkSlugAvailable(slug))) {
    suffix++;
    slug = `${generateSlug(name)}-${suffix}`;
  }

  const leaguesRef = ref(db, 'leagues');
  const newLeagueRef = push(leaguesRef);
  const leagueId = newLeagueRef.key!;

  const league: League = {
    name,
    slug,
    ownerId,
    inviteCode: generateInviteCode(),
    createdAt: Date.now(),
  };

  // Save league, claim slug, and add owner as member
  await set(newLeagueRef, league);
  await set(ref(db, `leagueSlugs/${slug}`), leagueId);
  await set(ref(db, `leagueMembers/${leagueId}/${ownerId}`), true);
  await set(ref(db, `userLeagues/${ownerId}/${leagueId}`), true);

  return { ...league, id: leagueId };
};

/**
 * Get a league by its slug
 */
export const getLeagueBySlug = async (
  slug: string
): Promise<LeagueWithId | null> => {
  const slugRef = ref(db, `leagueSlugs/${slug}`);
  const slugSnapshot = await get(slugRef);

  if (!slugSnapshot.exists()) return null;

  const leagueId = slugSnapshot.val() as string;
  const leagueRef = ref(db, `leagues/${leagueId}`);
  const leagueSnapshot = await get(leagueRef);

  if (!leagueSnapshot.exists()) return null;

  return {
    id: leagueId,
    ...(leagueSnapshot.val() as League),
  };
};

/**
 * Get a league by invite code
 */
export const getLeagueByInviteCode = async (
  inviteCode: string
): Promise<LeagueWithId | null> => {
  const leaguesRef = ref(db, 'leagues');
  const snapshot = await get(leaguesRef);

  if (!snapshot.exists()) return null;

  const leagues = snapshot.val() as Record<string, League>;
  for (const [id, league] of Object.entries(leagues)) {
    if (league.inviteCode.toUpperCase() === inviteCode.toUpperCase()) {
      return { id, ...league };
    }
  }

  return null;
};

/**
 * Join a league
 */
export const joinLeague = async (
  leagueId: string,
  userId: string
): Promise<void> => {
  await set(ref(db, `leagueMembers/${leagueId}/${userId}`), true);
  await set(ref(db, `userLeagues/${userId}/${leagueId}`), true);
};

/**
 * Leave a league
 */
export const leaveLeague = async (
  leagueId: string,
  userId: string
): Promise<void> => {
  await remove(ref(db, `leagueMembers/${leagueId}/${userId}`));
  await remove(ref(db, `userLeagues/${userId}/${leagueId}`));
};

/**
 * Get members of a league
 */
export const getLeagueMembers = async (leagueId: string): Promise<string[]> => {
  const membersRef = ref(db, `leagueMembers/${leagueId}`);
  const snapshot = await get(membersRef);

  if (!snapshot.exists()) return [];

  return Object.keys(snapshot.val() as Record<string, boolean>);
};

/**
 * Check if user is a member of a league
 */
export const isLeagueMember = async (
  leagueId: string,
  userId: string
): Promise<boolean> => {
  const memberRef = ref(db, `leagueMembers/${leagueId}/${userId}`);
  const snapshot = await get(memberRef);
  return snapshot.exists();
};

/**
 * Subscribe to user's leagues
 */
export const subscribeToUserLeagues = (
  userId: string,
  callback: (leagues: LeagueWithId[]) => void
): Unsubscribe => {
  const userLeaguesRef = ref(db, `userLeagues/${userId}`);

  return onValue(userLeaguesRef, async (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }

    const leagueIds = Object.keys(snapshot.val() as Record<string, boolean>);
    const leagues: LeagueWithId[] = [];

    for (const leagueId of leagueIds) {
      const leagueRef = ref(db, `leagues/${leagueId}`);
      const leagueSnapshot = await get(leagueRef);
      if (leagueSnapshot.exists()) {
        const membersRef = ref(db, `leagueMembers/${leagueId}`);
        const membersSnapshot = await get(membersRef);
        const memberCount = membersSnapshot.exists()
          ? Object.keys(membersSnapshot.val() as Record<string, boolean>).length
          : 0;

        leagues.push({
          id: leagueId,
          ...(leagueSnapshot.val() as League),
          memberCount,
        });
      }
    }

    callback(leagues);
  });
};

/**
 * Regenerate invite code for a league (owner only)
 */
export const regenerateInviteCode = async (leagueId: string): Promise<string> => {
  const newCode = generateInviteCode();
  await update(ref(db, `leagues/${leagueId}`), { inviteCode: newCode });
  return newCode;
};

