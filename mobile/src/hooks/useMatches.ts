import { useEffect, useState } from 'react';
import { fetchMatches } from '../services/matchService';
import { subscribeToPredictions } from '../services/predictionService';
import { useAuth } from '../context/AuthContext';
import { Match, MatchesData, UserPredictions } from '@prode/shared';
import { MatchFilter } from '../components/FilterBar';

export interface MatchSection {
  title: string;
  data: Match[];
}

const fmt = (date: string) =>
  new Date(date).toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

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
      const key = m.round || 'Eliminatoria';
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

  const sections: MatchSection[] =
    filter === 'group' ? byGroup(allMatches) :
    filter === 'knockout' ? byKnockout(allMatches) :
    byDate(allMatches);

  const refresh = () => { setRefreshing(true); load(true); };

  return { sections, predictions, loading, refreshing, refresh };
};
