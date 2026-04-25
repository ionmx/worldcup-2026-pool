export interface Prediction {
  homePrediction: number;
  awayPrediction: number;
  points: number;
  updatedAt: number;
}

export interface UserPredictions {
  [gameId: string]: Prediction;
}
