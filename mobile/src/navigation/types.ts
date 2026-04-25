import { LeagueWithId } from '@prode/shared';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Matches: undefined;
  Standings: undefined;
  Leagues: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  LeagueSelector: undefined;
  NewLeague: undefined;
  JoinLeague: undefined;
  LeagueDetail: { league: LeagueWithId };
};
