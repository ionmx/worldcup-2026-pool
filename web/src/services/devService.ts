import { db } from '../firebase';
import { ref, set, get, remove } from 'firebase/database';
import type { UserData } from './userService';
import type { MatchesData } from './matchService';
import type { Prediction } from './predictionService';

const MOCK_FIRST_NAMES = [
  'James',
  'Lars',
  'Kirk',
  'Cliff',
  'Dave',
  'Tom',
  'Kerry',
  'Jeff',
  'Scott',
  'Chuck',
  'Gary',
  'Mille',
  'Bobby',
  'Max',
  'Phil',
  'Jason',
  'Rob',
  'Lemmy',
  'Ozzy',
  'Ronnie',
  'Dimebag',
  'Vinnie',
  'Rex',
  'Zakk',
];

const MOCK_LAST_NAMES = [
  'Hetfield',
  'Mustaine',
  'Araya',
  'Hanneman',
  'Lombardo',
  'Burton',
  'Hammett',
  'Ulrich',
  'King',
  'Holt',
  'Skolnick',
  'Petrozza',
  'Cavalera',
  'Anselmo',
  'Halford',
  'Dickinson',
  'Kilmister',
  'Osbourne',
  'Dio',
  'Iommi',
  'Butler',
  'Abbott',
  'Brown',
  'Wylde',
];

const generateMockUser = (index: number, timestamp: number): UserData => {
  const firstName =
    MOCK_FIRST_NAMES[Math.floor(Math.random() * MOCK_FIRST_NAMES.length)];
  const lastName =
    MOCK_LAST_NAMES[Math.floor(Math.random() * MOCK_LAST_NAMES.length)];
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
  let created = 0;

  for (const matchId of matchIds) {
    // Generate random score predictions (0-5 goals each)
    const homePrediction = Math.floor(Math.random() * 6);
    const awayPrediction = Math.floor(Math.random() * 6);

    const prediction: Prediction = {
      homePrediction,
      awayPrediction,
      points: 0, // Cloud function will calculate
      updatedAt: Date.now(),
    };

    await set(ref(db, `predictions/${userId}/${matchId}`), prediction);
    created++;
  }

  return created;
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
