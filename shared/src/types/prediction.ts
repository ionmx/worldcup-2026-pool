export interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
  updatedAt: number;
  penaltyWinner?: 'home' | 'away';
}

export interface UserPredictions {
  [gameId: string]: Prediction;
}
