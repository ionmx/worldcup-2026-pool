export interface Match {
  game: number;
  fifaId: string;
  round: string;
  group: string | null;
  date: string;
  timestamp: number;
  location: string;
  locationCity: string;
  locationCountry: string;
  home: string;
  homeName: string;
  homeScore: number;
  away: string;
  awayName: string;
  awayScore: number;
}

export interface MatchesData {
  [key: string]: Match;
}
