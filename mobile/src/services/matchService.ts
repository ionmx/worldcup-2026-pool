import { ref, get, set } from 'firebase/database';
import { db } from '../firebase/config';
import { Match, MatchesData } from '@prode/shared';

const FIFA_API_URL = 'https://api.fifa.com/api/v3/calendar/matches';
const SEASON_ID = '285023';
const COMPETITION_ID = '17';

interface FifaApiMatch {
  IdMatch: string;
  StageName: Array<{ Description: string }>;
  GroupName: Array<{ Description: string }> | null;
  Date: string;
  Stadium: {
    Name: Array<{ Description: string }>;
    CityName: Array<{ Description: string }>;
    IdCountry: string;
  };
  Home: { Abbreviation: string | null; ShortClubName: string | null; Score: number | null };
  Away: { Abbreviation: string | null; ShortClubName: string | null; Score: number | null };
  PlaceHolderA: string;
  PlaceHolderB: string;
}

const transformFifaData = (results: FifaApiMatch[]): MatchesData => {
  const matches: MatchesData = {};
  results.forEach((item, index) => {
    const game = index + 1;
    matches[String(game)] = {
      game,
      fifaId: item.IdMatch,
      round: item.StageName?.[0]?.Description ?? '',
      group: item.GroupName?.[0]?.Description?.replace('Group ', '') ?? null,
      date: item.Date,
      timestamp: Math.floor(new Date(item.Date).getTime() / 1000),
      location: item.Stadium?.Name?.[0]?.Description ?? '',
      locationCity: item.Stadium?.CityName?.[0]?.Description ?? '',
      locationCountry: item.Stadium?.IdCountry ?? '',
      home: item.Home?.Abbreviation ?? item.PlaceHolderA,
      homeName: item.Home?.ShortClubName ?? item.PlaceHolderA,
      homeScore: item.Home?.Score ?? -1,
      away: item.Away?.Abbreviation ?? item.PlaceHolderB,
      awayName: item.Away?.ShortClubName ?? item.PlaceHolderB,
      awayScore: item.Away?.Score ?? -1,
    };
  });
  return matches;
};

export const fetchMatches = async (): Promise<MatchesData> => {
  const snapshot = await get(ref(db, 'matches'));
  if (snapshot.exists()) return snapshot.val() as MatchesData;

  const url = new URL(FIFA_API_URL);
  url.searchParams.set('idseason', SEASON_ID);
  url.searchParams.set('idcompetition', COMPETITION_ID);
  url.searchParams.set('count', '500');

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`FIFA API error: ${response.status}`);
  const data = await response.json() as { Results: FifaApiMatch[] };
  const matches = transformFifaData(data.Results);

  try {
    await set(ref(db, 'matches'), matches);
  } catch {
    // Requires admin — silently skip
  }

  return matches;
};
