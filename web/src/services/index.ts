export { fetchMatches, getMatch, refreshMatches } from './matchService';
export type { Match, MatchesData } from './matchService';

export {
  checkUsernameAvailable,
  getUserByUsername,
  handleUserLogin,
  sanitizeUsername,
  subscribeToLeaderboard,
  updateUserProfile,
  uploadProfilePicture,
} from './userService';
export type { UserData, UserWithId } from './userService';

export {
  getPrediction,
  getUserPredictions,
  savePrediction,
  subscribeToPredictions,
} from './predictionService';
export type { Prediction, UserPredictions } from './predictionService';
