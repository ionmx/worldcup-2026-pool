import { db } from '../firebase';
import { ref, set, get, remove } from 'firebase/database';
import type { UserData } from './userService';
import type { MatchesData } from './matchService';
import type { Prediction } from './predictionService';

// [firstName, lastName]
const MOCK_NAMES: [string, string][] = [
  ['James', 'Hetfield'],
  ['Dave', 'Mustaine'],
  ['Tom', 'Araya'],
  ['Scott', 'Ian'],
  ['Trent', 'Reznor'],
  ['Cliff', 'Burton'],
  ['Kirk', 'Hammett'],
  ['Lars', 'Ulrich'],
  ['Les', 'Claypool'],
  ['Max', 'Cavalera'],
  ['Lemmy', 'Kilmister'],
  ['Ozzy', 'Osbourne'],
  ['Björk', 'Guðmundsdóttir'],
  ['Cate', 'Blanchett'],
  ['Nicole', 'Kidman'],
  ['Charlize', 'Theron'],
  ['Scarlett', 'Johansson'],
  ['Natalie', 'Portman'],
  ['Emma', 'Stone'],
  ['Margot', 'Robbie'],
  ['Viola', 'Davis'],
  ['Sandra', 'Bullock'],
  ['Julia', 'Roberts'],
  ['Angelina', 'Jolie'],
];

const generateMockUser = (index: number, timestamp: number): UserData => {
  // Scramble: random first name + random last name from different entries
  const [firstName] = MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
  const [, lastName] =
    MOCK_NAMES[Math.floor(Math.random() * MOCK_NAMES.length)];
  const displayName = `${firstName} ${lastName}`;
  const userName = `${firstName.toLowerCase()}${lastName.toLowerCase()}${index}`;

  // Generate consistent avatar using pravatar.cc with unique seed
  const avatarSeed = `${timestamp}_${index}`;
  const photoURL = `https://i.pravatar.cc/150?u=${avatarSeed}`;

  return {
    email: `${userName}@mock.test`,
    displayName,
    userName,
    photoURL,
    score: 0, // Cloud function will calculate based on predictions
    admin: false,
  };
};

/**
 * Generate random predictions for a user
 */
const generatePredictionsForUser = async (
  userId: string,
  matches: MatchesData
): Promise<number> => {
  const matchIds = Object.keys(matches);
  const now = Date.now();

  // Build all predictions as a single update object
  const updates: Record<string, Prediction> = {};
  for (const matchId of matchIds) {
    updates[matchId] = {
      homePrediction: Math.floor(Math.random() * 6),
      awayPrediction: Math.floor(Math.random() * 6),
      points: 0, // Cloud function will calculate
      updatedAt: now,
    };
  }

  // Single atomic write for all predictions
  await set(ref(db, `predictions/${userId}`), updates);

  return matchIds.length;
};

/**
 * Generate mock users with random predictions
 */
export const generateMockUsers = async (count: number): Promise<number> => {
  // Get all matches for predictions
  const matchesRef = ref(db, 'matches');
  const matchesSnapshot = await get(matchesRef);
  const matches = matchesSnapshot.exists()
    ? (matchesSnapshot.val() as MatchesData)
    : null;

  const timestamp = Date.now();
  let created = 0;

  for (let i = 0; i < count; i++) {
    const mockId = `mock_${timestamp}_${i}`;
    const userData = generateMockUser(i, timestamp);

    // Create user
    await set(ref(db, `users/${mockId}`), {
      ...userData,
      mock: true, // Flag to identify mock data
    });

    // Claim username
    await set(ref(db, `usernames/${userData.userName}`), mockId);

    // Generate predictions if matches exist
    if (matches) {
      await generatePredictionsForUser(mockId, matches);
    }

    created++;
  }

  return created;
};

/**
 * Remove all mock users from the database (including predictions)
 */
export const clearMockUsers = async (): Promise<number> => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);

  if (!snapshot.exists()) return 0;

  const users = snapshot.val() as Record<string, UserData & { mock?: boolean }>;
  let removed = 0;

  for (const [uid, user] of Object.entries(users)) {
    if (user.mock) {
      // Remove user
      await remove(ref(db, `users/${uid}`));
      // Remove username claim
      await remove(ref(db, `usernames/${user.userName}`));
      // Remove predictions
      await remove(ref(db, `predictions/${uid}`));
      removed++;
    }
  }

  return removed;
};

/**
 * Get count of mock users
 */
export const getMockUserCount = async (): Promise<number> => {
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);

  if (!snapshot.exists()) return 0;

  const users = snapshot.val() as Record<string, UserData & { mock?: boolean }>;
  return Object.values(users).filter((u) => u.mock).length;
};
