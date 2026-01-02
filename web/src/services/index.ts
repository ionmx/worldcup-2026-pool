export { fetchMatches, getMatch, refreshMatches } from './matchService';
export type { Match, MatchesData } from './matchService';

export { checkUsernameAvailable, getUserByUsername, handleUserLogin, sanitizeUsername, updateUserProfile, uploadProfilePicture } from './userService';
export type { UserData } from './userService';

export { getPrediction, getUserPredictions, savePrediction, subscribeToPredictions } from './predictionService';
export type { Prediction, UserPredictions } from './predictionService';

