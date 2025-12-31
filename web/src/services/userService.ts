import { db } from '../firebase';
import { ref, get, set, query, limitToFirst } from 'firebase/database';
import type { User } from 'firebase/auth';

export interface UserData {
  email: string;
  displayName: string;
  userName: string;
  photoURL: string;
  score: number;
  admin: boolean;
}

export const handleUserLogin = async (user: User) => {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    // Check if this is the first user to make them admin
    const usersRef = ref(db, 'users');
    const firstUserQuery = query(usersRef, limitToFirst(1));
    const usersSnapshot = await get(firstUserQuery);
    const isFirstUser = !usersSnapshot.exists();

    const userData: UserData = {
      email: user.email || '',
      displayName: user.displayName || '',
      userName: user.email ? user.email.split('@')[0] : 'user',
      photoURL: user.photoURL || '',
      score: 0,
      admin: isFirstUser,
    };

    await set(userRef, userData);
    return userData;
  }

  return snapshot.val() as UserData;
};
