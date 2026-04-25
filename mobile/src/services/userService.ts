import { ref, get, set, update, remove, query, limitToFirst, onValue } from 'firebase/database';
import { User } from 'firebase/auth';
import { db } from '../firebase/config';
import { UserData, UserWithId } from '@prode/shared';

export const handleUserLogin = async (user: User): Promise<UserData> => {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    const usersRef = ref(db, 'users');
    const firstUserQuery = query(usersRef, limitToFirst(1));
    const usersSnapshot = await get(firstUserQuery);
    const isFirstUser = !usersSnapshot.exists();

    const userData: UserData = {
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      score: 0,
      admin: isFirstUser,
    };

    await set(userRef, userData);
    return userData;
  }

  return snapshot.val() as UserData;
};

export const updateUserProfile = async (uid: string, displayName: string): Promise<void> => {
  await update(ref(db, `users/${uid}`), { displayName });
};

export const subscribeToLeaderboard = (
  memberIds: string[],
  callback: (users: UserWithId[]) => void
): (() => void) => {
  if (memberIds.length === 0) {
    callback([]);
    return () => {};
  }

  const usersById = new Map<string, UserWithId>();
  const emit = () => {
    callback([...usersById.values()].sort((a, b) => b.score - a.score));
  };

  const unsubscribes = memberIds.map((memberId) =>
    onValue(ref(db, `users/${memberId}`), (snapshot) => {
      if (snapshot.exists()) {
        usersById.set(memberId, { id: memberId, ...(snapshot.val() as UserData) });
      } else {
        usersById.delete(memberId);
      }
      emit();
    })
  );

  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};

export const deleteUserAccount = async (uid: string): Promise<void> => {
  const leaguesSnapshot = await get(ref(db, 'leagues'));
  if (leaguesSnapshot.exists()) {
    const ownedLeagues = Object.values(leaguesSnapshot.val() as Record<string, { ownerId?: string; name?: string }>)
      .filter((league) => league.ownerId === uid);

    if (ownedLeagues.length > 0) {
      const names = ownedLeagues.map((league) => league.name).filter(Boolean).join(', ');
      throw new Error(
        names
          ? `Primero eliminá o transferí tus ligas: ${names}`
          : 'Primero eliminá o transferí tus ligas'
      );
    }
  }

  const userLeaguesSnapshot = await get(ref(db, `userLeagues/${uid}`));
  if (userLeaguesSnapshot.exists()) {
    const leagueIds = Object.keys(userLeaguesSnapshot.val() as Record<string, boolean>);
    for (const leagueId of leagueIds) {
      await remove(ref(db, `leagueMembers/${leagueId}/${uid}`));
    }
    await remove(ref(db, `userLeagues/${uid}`));
  }
  await remove(ref(db, `predictions/${uid}`));
  await remove(ref(db, `users/${uid}`));
};
