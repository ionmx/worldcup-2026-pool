import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Match, Prediction } from '@prode/shared';
import { savePrediction, canPredict } from '../services/predictionService';
import { getTeamDisplayName, isKnownTeamCode, toFlagEmoji } from '../utils/teams';

const ROUND_ES: Record<string, string> = {
  'Round of 32': 'Ronda de 32',
  'Round of 16': 'Octavos de final',
  'Quarter-final': 'Cuartos de final',
  'Semi-final': 'Semifinal',
  'Final': 'Final',
  'Third place play-off': 'Tercer puesto',
  'Play-off': 'Repechaje',
};

const isMatchDefined = (match: Match): boolean => isKnownTeamCode(match.home) && isKnownTeamCode(match.away);
const translateRound = (round?: string): string => {
  if (!round) return 'Eliminatoria';
  return ROUND_ES[round] || round;
};

interface Props {
  match: Match;
  userId?: string;
  prediction?: Prediction;
  showDate?: boolean;
}

const MatchCardComponent: React.FC<Props> = ({ match, userId, prediction, showDate = false }) => {
  const [home, setHome] = useState(prediction?.homePrediction?.toString() ?? '');
  const [away, setAway] = useState(prediction?.awayPrediction?.toString() ?? '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (prediction) {
      setHome(prediction.homePrediction?.toString() ?? '');
      setAway(prediction.awayPrediction?.toString() ?? '');
    }
  }, [prediction]);

  useEffect(() => {
    if (saveStatus !== 'saved') return;
    const timeout = setTimeout(() => setSaveStatus('idle'), 1800);
    return () => clearTimeout(timeout);
  }, [saveStatus]);

  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;
  const defined = isMatchDefined(match);
  const open = canPredict(match.timestamp);
  const editable = !!userId && open && !isPlayed && defined;
  const saving = saveStatus === 'saving';

  const isLive =
    !isPlayed &&
    Date.now() >= match.timestamp * 1000 &&
    Date.now() < match.timestamp * 1000 + 150 * 60 * 1000;

  const time = new Date(match.date).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  });
  const shortDate = new Date(match.date).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'short',
  });

  const showPoints = isPlayed && !!prediction;
  const pts = prediction?.points ?? 0;

  const save = async () => {
    if (!editable || !userId) return;
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    setSaveStatus('saving');
    try {
      await savePrediction(userId, String(match.game), h, a);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };

  const onBlur = () => {
    if (home !== '' && away !== '') save();
  };

  const homeFlag = defined ? toFlagEmoji(match.home) : '🏳️';
  const awayFlag = defined ? toFlagEmoji(match.away) : '🏳️';
  const homeName = defined ? getTeamDisplayName(match.home, match.homeName) : match.home;
  const awayName = defined ? getTeamDisplayName(match.away, match.awayName) : match.away;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>
          {showDate
            ? shortDate
            : match.group ? `Grupo ${match.group}` : translateRound(match.round)}
        </Text>
        <View style={styles.headerRight}>
          {saving && <ActivityIndicator size="small" color="#22c55e" />}
          {isLive && <Text style={styles.liveBadge}>● EN VIVO</Text>}
          {!defined && <Text style={styles.tbdBadge}>POR DEFINIRSE</Text>}
          {!isPlayed && defined && !open && <Text style={styles.closedBadge}>CERRADO</Text>}
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      {/* Match body: home | center | away */}
      <View style={styles.body}>
        {/* Home team */}
        <View style={styles.teamBlock}>
          <Text style={styles.flag}>{homeFlag}</Text>
          <Text style={styles.teamName} numberOfLines={2}>{homeName}</Text>
        </View>

        {/* Center: real score + prediction + points */}
        <View style={styles.centerBlock}>
          {/* Real score */}
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreNum, isPlayed && styles.scorePlayed]}>
              {isPlayed ? String(match.homeScore) : '—'}
            </Text>
            <Text style={styles.scoreSep}>:</Text>
            <Text style={[styles.scoreNum, isPlayed && styles.scorePlayed]}>
              {isPlayed ? String(match.awayScore) : '—'}
            </Text>
          </View>

          {/* Prediction inputs or display */}
          {editable ? (
            <View style={styles.predictionEditor}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={home}
                  onChangeText={v => { setHome(v.replace(/\D/g, '').slice(0, 2)); setSaveStatus('idle'); }}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="?"
                  placeholderTextColor="#475569"
                  editable={!saving}
                  selectTextOnFocus
                />
                <Text style={styles.inputSep}>-</Text>
                <TextInput
                  style={styles.input}
                  value={away}
                  onChangeText={v => { setAway(v.replace(/\D/g, '').slice(0, 2)); setSaveStatus('idle'); }}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="?"
                  placeholderTextColor="#475569"
                  editable={!saving}
                  selectTextOnFocus
                />
              </View>
              {saveStatus !== 'idle' ? (
                <Text style={[styles.saveStatus, saveStatus === 'error' && styles.saveStatusError]}>
                  {saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'saved' ? 'Guardado' : 'Error al guardar'}
                </Text>
              ) : null}
            </View>
          ) : prediction && defined ? (
            <View style={styles.predDisplayRow}>
              <View style={[styles.predBox, isPlayed && (pts > 0 ? styles.predGreen : styles.predRed)]}>
                <Text style={styles.predNum}>{prediction.homePrediction}</Text>
              </View>
              <Text style={styles.predSep}>-</Text>
              <View style={[styles.predBox, isPlayed && (pts > 0 ? styles.predGreen : styles.predRed)]}>
                <Text style={styles.predNum}>{prediction.awayPrediction}</Text>
              </View>
            </View>
          ) : null}

          {/* Points badge */}
          {showPoints && (
            <View style={[styles.pointsBadge, pts > 0 ? styles.badgeGreen : styles.badgeRed]}>
              <Text style={styles.pointsText}>
                {pts === 15 ? '🥳' : pts > 0 ? '😄' : '😔'} {pts > 0 ? `+${pts}` : pts} pts
              </Text>
            </View>
          )}
        </View>

        {/* Away team */}
        <View style={styles.teamBlock}>
          <Text style={styles.flag}>{awayFlag}</Text>
          <Text style={styles.teamName} numberOfLines={2}>{awayName}</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer} numberOfLines={1}>
        {match.locationCity}{match.locationCountry ? `, ${match.locationCountry}` : ''}
      </Text>
    </View>
  );
};

export const MatchCard = React.memo(MatchCardComponent);

const NUM_STYLE = {
  fontVariant: ['tabular-nums' as const],
  includeFontPadding: false,
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0d1b2a',
  },
  headerLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveBadge: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  time: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  tbdBadge: {
    backgroundColor: '#78350f',
    color: '#fcd34d',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  closedBadge: {
    backgroundColor: '#1e3a5f',
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  body: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
  },

  teamBlock: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  flag: { fontSize: 34 },
  teamName: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },

  centerBlock: {
    width: 124,
    alignItems: 'center',
    gap: 10,
  },
  predictionEditor: { alignItems: 'center', gap: 4 },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreNum: {
    ...NUM_STYLE,
    color: '#334155',
    fontSize: 26,
    fontWeight: '800',
    width: 34,
    textAlign: 'center',
    lineHeight: 32,
  },
  scorePlayed: { color: '#f1f5f9' },
  scoreSep: {
    color: '#334155',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  input: {
    ...NUM_STYLE,
    width: 44,
    height: 44,
    backgroundColor: '#0f172a',
    color: '#f1f5f9',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#22c55e',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  inputSep: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '600',
  },
  saveStatus: { color: '#22c55e', fontSize: 10, fontWeight: '700' },
  saveStatusError: { color: '#ef4444' },

  predDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  predBox: {
    width: 44,
    height: 44,
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  predGreen: { backgroundColor: '#14532d', borderColor: '#22c55e' },
  predRed: { backgroundColor: '#450a0a', borderColor: '#ef4444' },
  predSep: {
    color: '#475569',
    fontSize: 18,
    fontWeight: '600',
  },
  predNum: {
    ...NUM_STYLE,
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '600',
  },

  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeGreen: { backgroundColor: '#14532d' },
  badgeRed: { backgroundColor: '#1e293b' },
  pointsText: { color: '#86efac', fontSize: 12, fontWeight: '700' },

  footer: {
    color: '#334155',
    fontSize: 11,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#0d1b2a',
    textAlign: 'center',
  },
});
