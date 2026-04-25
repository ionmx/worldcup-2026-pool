import { ref, get, set, onValue } from 'firebase/database';
import { db } from '../firebase/config';
import { Prediction, UserPredictions } from '@prode/shared';

const PREDICTION_CUTOFF_SECONDS = 600; // 10 min before kickoff

export const canPredict = (matchTimestamp: number): boolean => {
  const now = Math.floor(Date.now() / 1000);
  return now < matchTimestamp - PREDICTION_CUTOFF_SECONDS;
};

export const savePrediction = async (
  uid: string,
  gameId: string,
  homePrediction: number,
  awayPrediction: number,
  penaltyWinner?: 'home' | 'away'
): Promise<void> => {
  const data: Record<string, unknown> = {
    homePrediction,
    awayPrediction,
    points: 0,
    updatedAt: Date.now(),
  };
  if (penaltyWinner) data.penaltyWinner = penaltyWinner;
  await set(ref(db, `predictions/${uid}/${gameId}`), data);
};

export const getUserPredictions = async (uid: string): Promise<UserPredictions> => {
  const snapshot = await get(ref(db, `predictions/${uid}`));
  return snapshot.exists() ? (snapshot.val() as UserPredictions) : {};
};

export const subscribeToPredictions = (
  uid: string,
  callback: (predictions: UserPredictions) => void
): (() => void) => {
  return onValue(ref(db, `predictions/${uid}`), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as UserPredictions) : {});
  });
};
