import { createContext } from 'react';
import { type LeagueWithId } from '../services';

export type LeagueContextType = {
  leagues: LeagueWithId[];
  selectedLeague: LeagueWithId | null;
  setSelectedLeague: (league: LeagueWithId | null) => void;
  leagueMemberIds: string[];
  loading: boolean;
};

export const LeagueContext = createContext<LeagueContextType>({
  leagues: [],
  selectedLeague: null,
  setSelectedLeague: () => {},
  leagueMemberIds: [],
  loading: true,
});

