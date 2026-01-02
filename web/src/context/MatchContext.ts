import { createContext } from 'react';
import { type MatchesData } from '../services/matchService';

export interface MatchContextType {
  matches: MatchesData | null;
  loading: boolean;
  error: string | null;
}

export const MatchContext = createContext<MatchContextType>({
  matches: null,
  loading: true,
  error: null,
});
