import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onValueWritten } from 'firebase-functions/v2/database';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.database();

const FIFA_COMPETITION_ID = '17';
const FIFA_SEASON_ID = '285023';

interface Match {
  game: number;
  fifaId: string;
  group: string | null;
  homeScore: number;
  awayScore: number;
  penaltyWinner: 'home' | 'away' | null;
}

interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
  penaltyWinner?: 'home' | 'away';
}

interface FifaMatch {
  IdMatch: string;
  Home: { Score: number | null };
  Away: { Score: number | null };
  HomeTeamPenaltyScore: number | null;
  AwayTeamPenaltyScore: number | null;
}

interface FifaApiResponse {
  Results: FifaMatch[];
}

const getWinner = (home: number, away: number): 'home' | 'away' | 'draw' => {
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
};

const isClose = (
  homeScore: number, awayScore: number,
  homePred: number, awayPred: number
): boolean =>
  Math.abs(homePred - homeScore) <= 1 && Math.abs(awayPred - awayScore) <= 1;

/**
 * 6 pts exact / 3 pts close (correct winner + each goal within 1) /
 * 2 pts correct winner / 0 pts wrong
 * +1 bonus if predicted draw in knockout, went to penalties, and penalty winner correct
 */
const calculatePoints = (
  homeScore: number,
  awayScore: number,
  homePrediction: number | null,
  awayPrediction: number | null,
  penaltyWinner: 'home' | 'away' | null,
  predPenaltyWinner?: 'home' | 'away'
): number => {
  if (homeScore < 0 || homePrediction === null || awayPrediction === null) return 0;

  let points = 0;

  if (homeScore === homePrediction && awayScore === awayPrediction) {
    points = 6;
  } else if (getWinner(homeScore, awayScore) === getWinner(homePrediction, awayPrediction)) {
    points = isClose(homeScore, awayScore, homePrediction, awayPrediction) ? 3 : 2;
  }

  if (
    penaltyWinner !== null &&
    homePrediction === awayPrediction &&
    predPenaltyWinner === penaltyWinner
  ) {
    points += 1;
  }

  return points;
};

export const updateMatchScores = onSchedule('every 1 minutes', async () => {
  logger.info('Updating match scores from FIFA API...');
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);

    const apiUrl = `https://api.fifa.com/api/v3/calendar/matches?idseason=${FIFA_SEASON_ID}&idcompetition=${FIFA_COMPETITION_ID}&from=${startOfDay.toISOString()}&to=${endOfDay.toISOString()}&count=500`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`FIFA API error: ${response.status}`);
    const data = await response.json() as FifaApiResponse;

    const matchesSnapshot = await db.ref('matches').once('value');
    const matches = matchesSnapshot.val() as Record<string, Match> | null;
    if (!matches) { logger.warn('No matches in DB'); return; }

    const updates: Record<string, number | string | null> = {};

    for (const fifaMatch of data.Results) {
      for (const [gameId, match] of Object.entries(matches)) {
        if (match.fifaId !== fifaMatch.IdMatch) continue;

        const homeScore = fifaMatch.Home?.Score ?? -1;
        const awayScore = fifaMatch.Away?.Score ?? -1;

        if (homeScore >= 0 && match.homeScore !== homeScore)
          updates[`matches/${gameId}/homeScore`] = homeScore;
        if (awayScore >= 0 && match.awayScore !== awayScore)
          updates[`matches/${gameId}/awayScore`] = awayScore;

        // Penalty winner only applies to knockout rounds (group === null)
        if (match.group === null) {
          const homePen = fifaMatch.HomeTeamPenaltyScore ?? 0;
          const awayPen = fifaMatch.AwayTeamPenaltyScore ?? 0;
          const hasPenalties = homePen > 0 || awayPen > 0;
          const penaltyWinner = hasPenalties ? (homePen > awayPen ? 'home' : 'away') : null;

          if (match.penaltyWinner !== penaltyWinner)
            updates[`matches/${gameId}/penaltyWinner`] = penaltyWinner;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await db.ref().update(updates);
      logger.info(`Applied ${Object.keys(updates).length} score updates`);
    }
  } catch (error) {
    logger.error('Error updating match scores:', error);
  }
});

export const updatePredictionPoints = onValueWritten(
  'matches/{matchId}',
  async (event) => {
    const matchId = event.params.matchId;
    const match = event.data.after.val() as Match | null;
    if (!match || match.homeScore < 0 || match.awayScore < 0) return;

    logger.info(`Recalculating points for match ${matchId}`);
    try {
      const usersSnapshot = await db.ref('users').once('value');
      const users = usersSnapshot.val() as Record<string, unknown> | null;
      if (!users) return;

      const updates: Record<string, number> = {};

      for (const userId of Object.keys(users)) {
        const predSnap = await db.ref(`predictions/${userId}/${matchId}`).once('value');
        const prediction = predSnap.val() as Prediction | null;
        if (!prediction) continue;

        const points = calculatePoints(
          match.homeScore,
          match.awayScore,
          prediction.homePrediction,
          prediction.awayPrediction,
          match.penaltyWinner ?? null,
          prediction.penaltyWinner
        );

        if (prediction.points !== points)
          updates[`predictions/${userId}/${matchId}/points`] = points;
      }

      if (Object.keys(updates).length > 0) {
        await db.ref().update(updates);
        logger.info(`Updated ${Object.keys(updates).length} prediction points`);
      }
    } catch (error) {
      logger.error('Error updating prediction points:', error);
    }
  }
);

export const updateUserScore = onValueWritten(
  'predictions/{userId}/{matchId}/points',
  async (event) => {
    const { userId } = event.params;
    const before = event.data.before.val() as number | null ?? 0;
    const after = event.data.after.val() as number | null ?? 0;
    if (before === after) return;

    const diff = after - before;
    logger.info(`User ${userId} points diff: ${diff}`);

    try {
      const scoreSnap = await db.ref(`users/${userId}/score`).once('value');
      const current = scoreSnap.val() as number | null ?? 0;
      const newScore = current + diff;

      // Update both private and public score so leaderboard stays in sync
      await db.ref().update({
        [`users/${userId}/score`]: newScore,
        [`publicUsers/${userId}/score`]: newScore,
      });

      logger.info(`User ${userId} score: ${newScore}`);
    } catch (error) {
      logger.error('Error updating user score:', error);
    }
  }
);
