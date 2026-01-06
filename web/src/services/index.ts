export { fetchMatches, getMatch, refreshMatches } from './matchService';
export type { Match, MatchesData } from './matchService';

export {
  checkUsernameAvailable,
  getUserByUsername,
  handleUserLogin,
  isReservedUsername,
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

export {
  checkSlugAvailable,
  createLeague,
  generateSlug,
  getLeagueBySlug,
  getLeagueByInviteCode,
  getLeagueMembers,
  isLeagueMember,
  joinLeague,
  leaveLeague,
  regenerateInviteCode,
  subscribeToLeagueMembers,
  subscribeToUserLeagues,
  updateLeague,
  uploadLeagueImage,
} from './leagueService';
export type { League, LeagueWithId } from './leagueService';
