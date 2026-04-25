import { ref, get, set, push, update, remove, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { League, LeagueWithId, generateSlug } from '@prode/shared';

export { generateSlug };

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

const checkSlugAvailable = async (slug: string): Promise<boolean> => {
  const snapshot = await get(ref(db, `leagueSlugs/${slug}`));
  return !snapshot.exists();
};

export const createLeague = async (
  name: string,
  ownerId: string,
  options?: { description?: string }
): Promise<LeagueWithId> => {
  let slug = generateSlug(name);
  let suffix = 0;
  while (!(await checkSlugAvailable(slug))) {
    suffix++;
    slug = `${generateSlug(name)}-${suffix}`;
  }

  const newLeagueRef = push(ref(db, 'leagues'));
  const leagueId = newLeagueRef.key!;
  const inviteCode = generateInviteCode();

  const league: Omit<League, 'inviteCode'> = {
    name,
    slug,
    ownerId,
    createdAt: Date.now(),
    ...(options?.description && { description: options.description }),
  };

  await set(newLeagueRef, league);
  await set(ref(db, `leagueSlugs/${slug}`), leagueId);
  await set(ref(db, `leagueSecrets/${leagueId}/inviteCode`), inviteCode);
  await set(ref(db, `inviteCodes/${inviteCode}`), leagueId);
  await set(ref(db, `leagueMembers/${leagueId}/${ownerId}`), { joinedAt: Date.now(), role: 'owner' });
  await set(ref(db, `userLeagues/${ownerId}/${leagueId}`), true);

  return { ...league, inviteCode, id: leagueId };
};

export const getLeagueByInviteCode = async (code: string): Promise<LeagueWithId | null> => {
  const finalCode = code.toUpperCase();
  const inviteSnapshot = await get(ref(db, `inviteCodes/${finalCode}`));
  if (inviteSnapshot.exists()) {
    const leagueId = inviteSnapshot.val() as string;
    const leagueSnapshot = await get(ref(db, `leagues/${leagueId}`));
    if (leagueSnapshot.exists()) {
      return { id: leagueId, ...(leagueSnapshot.val() as League), inviteCode: finalCode };
    }
  }

  // Legacy fallback for leagues created before inviteCodes/leagueSecrets existed.
  const snapshot = await get(ref(db, 'leagues'));
  if (!snapshot.exists()) return null;
  const leagues = snapshot.val() as Record<string, League>;
  for (const [id, league] of Object.entries(leagues)) {
    if (league.inviteCode?.toUpperCase() === finalCode) return { id, ...league, inviteCode: finalCode };
  }
  return null;
};

export const joinLeague = async (leagueId: string, userId: string, inviteCode: string): Promise<void> => {
  await set(ref(db, `leagueMembers/${leagueId}/${userId}`), {
    joinedAt: Date.now(),
    inviteCode: inviteCode.toUpperCase(),
  });
  await set(ref(db, `userLeagues/${userId}/${leagueId}`), true);
};

export const leaveLeague = async (leagueId: string, userId: string): Promise<void> => {
  await remove(ref(db, `leagueMembers/${leagueId}/${userId}`));
  await remove(ref(db, `userLeagues/${userId}/${leagueId}`));
};

export const getLeagueMembers = async (leagueId: string): Promise<string[]> => {
  const snapshot = await get(ref(db, `leagueMembers/${leagueId}`));
  if (!snapshot.exists()) return [];
  return Object.keys(snapshot.val() as Record<string, boolean>);
};

export const subscribeToLeagueMembers = (
  leagueId: string,
  callback: (memberIds: string[]) => void
): (() => void) => {
  return onValue(ref(db, `leagueMembers/${leagueId}`), (snapshot) => {
    if (!snapshot.exists()) { callback([]); return; }
    callback(Object.keys(snapshot.val() as Record<string, boolean>));
  });
};

export const subscribeToUserLeagues = (
  userId: string,
  callback: (leagues: LeagueWithId[]) => void
): (() => void) => {
  return onValue(ref(db, `userLeagues/${userId}`), async (snapshot) => {
    if (!snapshot.exists()) { callback([]); return; }
    const leagueIds = Object.keys(snapshot.val() as Record<string, boolean>);
    const leagues: LeagueWithId[] = [];
    for (const leagueId of leagueIds) {
      const leagueSnapshot = await get(ref(db, `leagues/${leagueId}`));
      if (leagueSnapshot.exists()) {
        const membersSnapshot = await get(ref(db, `leagueMembers/${leagueId}`));
        const secretSnapshot = await get(ref(db, `leagueSecrets/${leagueId}/inviteCode`));
        const league = leagueSnapshot.val() as League;
        const memberCount = membersSnapshot.exists()
          ? Object.keys(membersSnapshot.val() as Record<string, boolean>).length : 0;
        leagues.push({
          id: leagueId,
          ...league,
          inviteCode: secretSnapshot.exists() ? secretSnapshot.val() as string : league.inviteCode,
          memberCount,
        });
      }
    }
    callback(leagues);
  });
};

export const regenerateInviteCode = async (leagueId: string): Promise<string> => {
  const newCode = generateInviteCode();
  const secretSnapshot = await get(ref(db, `leagueSecrets/${leagueId}/inviteCode`));
  const leagueSnapshot = await get(ref(db, `leagues/${leagueId}`));
  const oldCode = secretSnapshot.exists()
    ? secretSnapshot.val() as string
    : (leagueSnapshot.val() as League | null)?.inviteCode;

  await update(ref(db), {
    [`leagueSecrets/${leagueId}/inviteCode`]: newCode,
    [`inviteCodes/${newCode}`]: leagueId,
    [`leagues/${leagueId}/inviteCode`]: null,
    ...(oldCode ? { [`inviteCodes/${oldCode}`]: null } : {}),
  });
  return newCode;
};

export const updateLeague = async (
  leagueId: string,
  updates: { name?: string; description?: string }
): Promise<void> => {
  const filtered: Record<string, string> = {};
  if (updates.name) filtered.name = updates.name;
  if (updates.description !== undefined) filtered.description = updates.description;
  await update(ref(db, `leagues/${leagueId}`), filtered);
};

export const deleteLeague = async (leagueId: string, slug: string): Promise<void> => {
  const secretSnapshot = await get(ref(db, `leagueSecrets/${leagueId}/inviteCode`));
  const leagueSnapshot = await get(ref(db, `leagues/${leagueId}`));
  const inviteCode = secretSnapshot.exists()
    ? secretSnapshot.val() as string
    : (leagueSnapshot.val() as League | null)?.inviteCode;
  const memberIds = await getLeagueMembers(leagueId);
  for (const memberId of memberIds) {
    await remove(ref(db, `userLeagues/${memberId}/${leagueId}`));
  }
  await remove(ref(db, `leagueMembers/${leagueId}`));
  await remove(ref(db, `leagueSecrets/${leagueId}`));
  if (inviteCode) await remove(ref(db, `inviteCodes/${inviteCode}`));
  await remove(ref(db, `leagueSlugs/${slug}`));
  await remove(ref(db, `leagues/${leagueId}`));
};
