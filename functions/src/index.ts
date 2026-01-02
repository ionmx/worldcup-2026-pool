import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.database();

// FIFA API constants for World Cup 2026
const FIFA_COMPETITION_ID = '17'; // FIFA World Cup
const FIFA_SEASON_ID = '285023'; // 2026

interface Match {
  game: number;
  fifaId: string;
  homeScore: number;
  awayScore: number;
}

interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
}

interface FifaMatch {
  IdMatch: string;
  Home: { Score: number | null };
  Away: { Score: number | null };
}

interface FifaApiResponse {
  Results: FifaMatch[];
}

/**
 * Determine the winner of a match
 */
const getWinner = (home: number, away: number): 'home' | 'away' | 'tied' => {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'tied';
};

/**
 * Calculate points for a prediction
 * - 15 points: Exact score
 * - Up to 10 points: Correct winner, minus difference from actual score (min 0)
 * - 0 points: Wrong winner or no prediction
 */
const calculatePoints = (
  homeScore: number,
  awayScore: number,
  homePrediction: number | null,
  awayPrediction: number | null
): number => {
  // No prediction or match not played yet
  if (homeScore < 0 || homePrediction === null || awayPrediction === null) {
    return 0;
  }

  // Exact score: 15 points
  if (homeScore === homePrediction && awayScore === awayPrediction) {
    return 15;
  }

  // Correct winner: 10 points minus difference (min 0)
  if (getWinner(homeScore, awayScore) === getWinner(homePrediction, awayPrediction)) {
    const difference = Math.abs(homePrediction - homeScore) + Math.abs(awayPrediction - awayScore);
    return Math.max(0, 10 - difference);
  }

  // Wrong winner: 0 points
  return 0;
};

/**
 * Scheduled function to fetch and update match scores from FIFA API
 * Runs every 1 minute during the tournament
 */
export const updateMatchScores = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    functions.logger.info('Updating match scores from FIFA API...');

    try {
      // Get today's date range
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const fromDate = startOfDay.toISOString();
      const toDate = endOfDay.toISOString();

      // Fetch today's matches from FIFA API
      const apiUrl = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&from=${fromDate}&to=${toDate}&count=500`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`FIFA API error: ${response.status}`);
      }

      const data = await response.json() as FifaApiResponse;

      // Get current matches from database
      const matchesSnapshot = await db.ref('matches').once('value');
      const matches = matchesSnapshot.val() as Record<string, Match> | null;

      if (!matches) {
        functions.logger.warn('No matches found in database');
        return null;
      }

      // Update scores for matching games
      const updates: Record<string, number> = {};

      for (const fifaMatch of data.Results) {
        for (const [gameId, match] of Object.entries(matches)) {
          if (match.fifaId === fifaMatch.IdMatch) {
            const homeScore = fifaMatch.Home?.Score ?? -1;
            const awayScore = fifaMatch.Away?.Score ?? -1;

            if (match.homeScore !== homeScore && homeScore >= 0) {
              updates[`matches/${gameId}/homeScore`] = homeScore;
              functions.logger.info(`Updated game ${gameId} home score: ${homeScore}`);
            }

            if (match.awayScore !== awayScore && awayScore >= 0) {
              updates[`matches/${gameId}/awayScore`] = awayScore;
              functions.logger.info(`Updated game ${gameId} away score: ${awayScore}`);
            }
          }
        }
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        functions.logger.info(`Applied ${Object.keys(updates).length} score updates`);
      }

      return null;
    } catch (error) {
      functions.logger.error('Error updating match scores:', error);
      return null;
    }
  });

/**
 * Triggered when a match is updated
 * Recalculates prediction points for all users for that match
 */
export const updatePredictionPoints = functions.database
  .ref('matches/{matchId}')
  .onWrite(async (change, context) => {
    const matchId = context.params.matchId;
    const match = change.after.val() as Match | null;

    if (!match) {
      functions.logger.warn(`Match ${matchId} was deleted`);
      return null;
    }

    // Only recalculate if match has scores
    if (match.homeScore < 0 || match.awayScore < 0) {
      return null;
    }

    functions.logger.info(`Updating prediction points for match ${matchId}`);

    try {
      // Get all users
      const usersSnapshot = await db.ref('users').once('value');
      const users = usersSnapshot.val() as Record<string, unknown> | null;

      if (!users) {
        return null;
      }

      const updates: Record<string, number> = {};

      // Calculate points for each user's prediction
      for (const userId of Object.keys(users)) {
        const predictionSnapshot = await db.ref(`predictions/${userId}/${matchId}`).once('value');
        const prediction = predictionSnapshot.val() as Prediction | null;

        if (prediction) {
          const points = calculatePoints(
            match.homeScore,
            match.awayScore,
            prediction.homePrediction,
            prediction.awayPrediction
          );

          if (prediction.points !== points) {
            updates[`predictions/${userId}/${matchId}/points`] = points;
            functions.logger.info(`User ${userId}: ${points} points for match ${matchId}`);
          }
        }
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        functions.logger.info(`Updated ${Object.keys(updates).length} prediction points`);
      }

      return null;
    } catch (error) {
      functions.logger.error('Error updating prediction points:', error);
      return null;
    }
  });

/**
 * Triggered when prediction points change
 * Updates the user's total score
 */
export const updateUserScore = functions.database
  .ref('predictions/{userId}/{matchId}/points')
  .onWrite(async (change, context) => {
    const { userId } = context.params;
    const beforePoints = change.before.val() as number | null ?? 0;
    const afterPoints = change.after.val() as number | null ?? 0;

    // No change in points
    if (beforePoints === afterPoints) {
      return null;
    }

    const pointsDiff = afterPoints - beforePoints;

    functions.logger.info(`User ${userId} points changed: ${beforePoints} -> ${afterPoints} (diff: ${pointsDiff})`);

    try {
      const scoreSnapshot = await db.ref(`users/${userId}/score`).once('value');
      const currentScore = scoreSnapshot.val() as number | null ?? 0;
      const newScore = currentScore + pointsDiff;

      await db.ref(`users/${userId}/score`).set(newScore);
      functions.logger.info(`User ${userId} total score: ${newScore}`);

      return null;
    } catch (error) {
      functions.logger.error('Error updating user score:', error);
      return null;
    }
  });
