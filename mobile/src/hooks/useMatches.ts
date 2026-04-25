import { useEffect, useMemo, useState } from 'react';
import { fetchMatches } from '../services/matchService';
import { subscribeToPredictions } from '../services/predictionService';
import { useAuth } from '../context/AuthContext';
import { Match, MatchesData, UserPredictions } from '@prode/shared';
import { MatchFilter } from '../components/FilterBar';

const ROUND_ES: Record<string, string> = {
  'Round of 32': 'Ronda de 32',
  'Round of 16': 'Octavos de final',
  'Quarter-final': 'Cuartos de final',
  'Semi-final': 'Semifinal',
  'Final': 'Final',
  'Third place play-off': 'Tercer puesto',
  'Play-off': 'Repechaje',
};
const translateRound = (round?: string): string => ROUND_ES[round ?? ''] || round || 'Eliminatoria';
const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export interface MatchSection {
  title: string;
  data: Match[];
}

const fmt = (date: string) => dateFormatter.format(new Date(date));

const byDate = (data: MatchesData): MatchSection[] => {
  const grouped: Record<string, Match[]> = {};
  Object.values(data).forEach((m) => {
    const key = fmt(m.date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });
  return Object.entries(grouped)
    .map(([title, matches]) => ({ title, data: matches.sort((a, b) => a.timestamp - b.timestamp) }))
    .sort((a, b) => a.data[0].timestamp - b.data[0].timestamp);
};

const byGroup = (data: MatchesData): MatchSection[] => {
  const grouped: Record<string, Match[]> = {};
  Object.values(data)
    .filter((m) => m.group)
    .forEach((m) => {
      const key = `Grupo ${m.group}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
  return Object.entries(grouped)
    .map(([title, matches]) => ({ title, data: matches.sort((a, b) => a.timestamp - b.timestamp) }))
    .sort((a, b) => a.title.localeCompare(b.title));
};

const byKnockout = (data: MatchesData): MatchSection[] => {
  const grouped: Record<string, Match[]> = {};
  Object.values(data)
    .filter((m) => !m.group)
    .forEach((m) => {
      const key = translateRound(m.round);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
  return Object.entries(grouped)
    .map(([title, matches]) => ({ title, data: matches.sort((a, b) => a.timestamp - b.timestamp) }))
    .sort((a, b) => a.data[0].timestamp - b.data[0].timestamp);
};

export const useMatches = (filter: MatchFilter) => {
  const { user } = useAuth();
  const [allMatches, setAllMatches] = useState<MatchesData>({});
  const [predictions, setPredictions] = useState<UserPredictions>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchMatches();
      setAllMatches(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!user) return;
    return subscribeToPredictions(user.uid, setPredictions);
  }, [user?.uid]);

  const sectionsByFilter: Record<MatchFilter, MatchSection[]> = useMemo(() => ({
    date: byDate(allMatches),
    group: byGroup(allMatches),
    knockout: byKnockout(allMatches),
  }), [allMatches]);

  const sections = sectionsByFilter[filter];

  const refresh = () => { setRefreshing(true); load(true); };

  return { sections, predictions, loading, refreshing, refresh };
};
