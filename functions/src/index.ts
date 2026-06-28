import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onValueWritten } from 'firebase-functions/v2/database';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.database();

// FIFA API constants for World Cup 2026
const FIFA_COMPETITION_ID = '17'; // FIFA World Cup
const FIFA_SEASON_ID = '285023'; // 2026

interface Match {
  game: number;
  fifaId: string;
  home: string;
  homeName: string;
  homeScore: number;
  away: string;
  awayName: string;
  awayScore: number;
}

interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
}

interface FifaMatch {
  IdMatch: string;
  Home: {
    Abbreviation: string | null;
    ShortClubName: string | null;
    Score: number | null;
  };
  Away: {
    Abbreviation: string | null;
    ShortClubName: string | null;
    Score: number | null;
  };
  PlaceHolderA: string;
  PlaceHolderB: string;
}

const getTeamFields = (fifaMatch: FifaMatch) => ({
  home: fifaMatch.Home?.Abbreviation ?? fifaMatch.PlaceHolderA,
  homeName: fifaMatch.Home?.ShortClubName ?? fifaMatch.PlaceHolderA,
  away: fifaMatch.Away?.Abbreviation ?? fifaMatch.PlaceHolderB,
  awayName: fifaMatch.Away?.ShortClubName ?? fifaMatch.PlaceHolderB,
});

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
 * Scheduled function to fetch and update matches from FIFA API
 * Runs every 1 minute during the tournament
 */
export const updateMatchScores = onSchedule('every 1 minutes', async () => {
  logger.info('Updating matches from FIFA API...');

  try {
    const apiUrl = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&count=500`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`FIFA API error: ${response.status}`);
    }

    const data = await response.json() as FifaApiResponse;

    // Get current matches from database
    const matchesSnapshot = await db.ref('matches').once('value');
    const matches = matchesSnapshot.val() as Record<string, Match> | null;

    if (!matches) {
      logger.warn('No matches found in database');
      return;
    }

    const updates: Record<string, string | number> = {};

    for (const fifaMatch of data.Results) {
      for (const [gameId, match] of Object.entries(matches)) {
        if (match.fifaId !== fifaMatch.IdMatch) {
          continue;
        }

        const homeScore = fifaMatch.Home?.Score ?? -1;
        const awayScore = fifaMatch.Away?.Score ?? -1;

        if (match.homeScore !== homeScore && homeScore >= 0) {
          updates[`matches/${gameId}/homeScore`] = homeScore;
          logger.info(`Updated game ${gameId} home score: ${homeScore}`);
        }

        if (match.awayScore !== awayScore && awayScore >= 0) {
          updates[`matches/${gameId}/awayScore`] = awayScore;
          logger.info(`Updated game ${gameId} away score: ${awayScore}`);
        }

        const teams = getTeamFields(fifaMatch);
        if (match.home !== teams.home) {
          updates[`matches/${gameId}/home`] = teams.home;
          logger.info(`Updated game ${gameId} home: ${teams.home}`);
        }
        if (match.homeName !== teams.homeName) {
          updates[`matches/${gameId}/homeName`] = teams.homeName;
          logger.info(`Updated game ${gameId} home name: ${teams.homeName}`);
        }
        if (match.away !== teams.away) {
          updates[`matches/${gameId}/away`] = teams.away;
          logger.info(`Updated game ${gameId} away: ${teams.away}`);
        }
        if (match.awayName !== teams.awayName) {
          updates[`matches/${gameId}/awayName`] = teams.awayName;
          logger.info(`Updated game ${gameId} away name: ${teams.awayName}`);
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      logger.info(`Applied ${Object.keys(updates).length} match updates`);
    }
  } catch (error) {
    logger.error('Error updating match scores:', error);
  }
});

/**
 * Triggered when a match is updated
 * Recalculates prediction points for all users for that match
 */
export const updatePredictionPoints = onValueWritten(
  'matches/{matchId}',
  async (event) => {
    const matchId = event.params.matchId;
    const match = event.data.after.val() as Match | null;

    if (!match) {
      logger.warn(`Match ${matchId} was deleted`);
      return;
    }

    // Only recalculate if match has scores
    if (match.homeScore < 0 || match.awayScore < 0) {
      return;
    }

    logger.info(`Updating prediction points for match ${matchId}`);

    try {
      // Get all users
      const usersSnapshot = await db.ref('users').once('value');
      const users = usersSnapshot.val() as Record<string, unknown> | null;

      if (!users) {
        return;
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
            logger.info(`User ${userId}: ${points} points for match ${matchId}`);
          }
        }
      }

      // Apply all updates at once
      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        logger.info(`Updated ${Object.keys(updates).length} prediction points`);
      }
    } catch (error) {
      logger.error('Error updating prediction points:', error);
    }
  }
);

/**
 * Triggered when prediction points change
 * Updates the user's total score
 */
export const updateUserScore = onValueWritten(
  'predictions/{userId}/{matchId}/points',
  async (event) => {
    const { userId } = event.params;
    const beforePoints = event.data.before.val() as number | null ?? 0;
    const afterPoints = event.data.after.val() as number | null ?? 0;

    // No change in points
    if (beforePoints === afterPoints) {
      return;
    }

    const pointsDiff = afterPoints - beforePoints;

    logger.info(`User ${userId} points changed: ${beforePoints} -> ${afterPoints} (diff: ${pointsDiff})`);

    try {
      const scoreSnapshot = await db.ref(`users/${userId}/score`).once('value');
      const currentScore = scoreSnapshot.val() as number | null ?? 0;
      const newScore = currentScore + pointsDiff;

      await db.ref(`users/${userId}/score`).set(newScore);
      logger.info(`User ${userId} total score: ${newScore}`);
    } catch (error) {
      logger.error('Error updating user score:', error);
    }
  }
);
