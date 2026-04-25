import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Match, Prediction } from '@prode/shared';
import { savePrediction, canPredict } from '../services/predictionService';

const FIFA_TO_ISO2: Record<string, string> = {
  ARG: 'AR', BRA: 'BR', URU: 'UY', COL: 'CO', ECU: 'EC', CHI: 'CL',
  PER: 'PE', PAR: 'PY', BOL: 'BO', VEN: 'VE',
  USA: 'US', CAN: 'CA', MEX: 'MX', CRC: 'CR', HON: 'HN',
  JAM: 'JM', PAN: 'PA', TTO: 'TT',
  FRA: 'FR', GER: 'DE', ESP: 'ES', ENG: 'GB', POR: 'PT',
  NED: 'NL', BEL: 'BE', ITA: 'IT', CRO: 'HR', SUI: 'CH',
  DEN: 'DK', POL: 'PL', SRB: 'RS', AUT: 'AT', SWE: 'SE',
  NOR: 'NO', TUR: 'TR', GRE: 'GR', UKR: 'UA', ROU: 'RO',
  HUN: 'HU', SVK: 'SK', CZE: 'CZ', ALB: 'AL', SLO: 'SI',
  GEO: 'GE', SCO: 'GB', WAL: 'GB',
  MAR: 'MA', SEN: 'SN', NGA: 'NG', EGY: 'EG', CMR: 'CM',
  CIV: 'CI', GHA: 'GH', TUN: 'TN', ALG: 'DZ', MLI: 'ML',
  JPN: 'JP', KOR: 'KR', IRN: 'IR', SAU: 'SA', AUS: 'AU',
  QAT: 'QA', IRQ: 'IQ', JOR: 'JO', UAE: 'AE', NZL: 'NZ',
};

const toFlagEmoji = (code: string): string => {
  const iso2 = FIFA_TO_ISO2[code];
  if (!iso2) return '🏳️';
  return [...iso2.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('');
};

// Equipos reales son 2-3 letras mayúsculas solamente
const isKnownTeam = (code: string): boolean => /^[A-Z]{2,3}$/.test(code);

const isMatchDefined = (match: Match): boolean =>
  isKnownTeam(match.home) && isKnownTeam(match.away);

interface Props {
  match: Match;
  userId?: string;
  prediction?: Prediction;
}

export const MatchCard: React.FC<Props> = ({ match, userId, prediction }) => {
  const [home, setHome] = useState(prediction?.homePrediction?.toString() ?? '');
  const [away, setAway] = useState(prediction?.awayPrediction?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prediction) {
      setHome(prediction.homePrediction?.toString() ?? '');
      setAway(prediction.awayPrediction?.toString() ?? '');
    }
  }, [prediction]);

  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;
  const defined = isMatchDefined(match);
  const open = canPredict(match.timestamp);
  const editable = !!userId && open && !isPlayed && defined;

  const isLive =
    !isPlayed &&
    Date.now() >= match.timestamp * 1000 &&
    Date.now() < match.timestamp * 1000 + 150 * 60 * 1000;

  const time = new Date(match.date).toLocaleTimeString('es-AR', {
    hour: '2-digit', minute: '2-digit',
  });

  const showPoints = isPlayed && prediction;
  const pts = prediction?.points ?? 0;

  const save = async () => {
    if (!editable || !userId) return;
    const h = parseInt(home, 10);
    const a = parseInt(away, 10);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return;
    setSaving(true);
    try {
      await savePrediction(userId, String(match.game), h, a);
    } finally {
      setSaving(false);
    }
  };

  const onBlur = () => {
    if (home !== '' && away !== '') save();
  };

  const renderTeamRow = (
    code: string,
    name: string,
    score: number,
    predValue: string,
    setPred: (v: string) => void,
    isHome: boolean,
  ) => (
    <View style={styles.teamRow}>
      <Text style={styles.flag}>{defined ? toFlagEmoji(code) : '🏳️'}</Text>
      <Text style={styles.teamName} numberOfLines={1}>
        {defined ? name : code}
      </Text>

      {/* Score real */}
      <View style={styles.scoreBox}>
        <Text style={[styles.scoreText, isPlayed && styles.scoreTextPlayed]}>
          {isPlayed ? score : '–'}
        </Text>
      </View>

      {/* Predicción */}
      {editable ? (
        <TextInput
          style={styles.input}
          value={predValue}
          onChangeText={v => setPred(v.replace(/\D/g, '').slice(0, 2))}
          onBlur={onBlur}
          keyboardType="number-pad"
          maxLength={2}
          placeholder="?"
          placeholderTextColor="#475569"
          editable={!saving}
          selectTextOnFocus
        />
      ) : prediction && defined ? (
        <View style={[styles.predBox, isPlayed && (pts > 0 ? styles.predGreen : styles.predRed)]}>
          <Text style={styles.predText}>
            {isHome ? prediction.homePrediction : prediction.awayPrediction}
          </Text>
        </View>
      ) : (
        <View style={styles.inputPlaceholder} />
      )}
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLeft}>
          {match.group ? `Grupo ${match.group}` : match.round}
        </Text>
        <View style={styles.headerRight}>
          {isLive && <Text style={styles.liveDot}>🔴 </Text>}
          {!defined && <Text style={styles.tbdBadge}>Por definirse</Text>}
          {!isPlayed && defined && !open && <Text style={styles.closedBadge}>Cerrado</Text>}
          <Text style={styles.time}>{time}</Text>
          {saving && <ActivityIndicator size="small" color="#22c55e" style={{ marginLeft: 6 }} />}
        </View>
      </View>

      {/* Equipos */}
      <View style={styles.teamsContainer}>
        <View style={styles.teams}>
          {renderTeamRow(match.home, match.homeName, match.homeScore, home, setHome, true)}
          {renderTeamRow(match.away, match.awayName, match.awayScore, away, setAway, false)}
        </View>

        {/* Badge de puntos */}
        {showPoints && (
          <View style={[styles.pointsBadge, pts > 0 ? styles.badgeGreen : styles.badgeRed]}>
            <Text style={styles.pointsEmoji}>
              {pts === 15 ? '🥳' : pts > 0 ? '😄' : '😔'}
            </Text>
            <Text style={styles.pointsLabel}>{pts > 0 ? `+${pts}` : pts}</Text>
            <Text style={styles.pointsPts}>pts</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <Text style={styles.footer} numberOfLines={1}>
        {match.locationCity}{match.locationCountry ? `, ${match.locationCountry}` : ''}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#0f2236',
  },
  headerLeft: { color: '#64748b', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { fontSize: 11 },
  time: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  tbdBadge: {
    backgroundColor: '#78350f', color: '#fcd34d',
    fontSize: 10, fontWeight: '700', paddingHorizontal: 7,
    paddingVertical: 2, borderRadius: 4, textTransform: 'uppercase',
  },
  closedBadge: {
    backgroundColor: '#1e293b', color: '#64748b',
    fontSize: 10, fontWeight: '600', paddingHorizontal: 7,
    paddingVertical: 2, borderRadius: 4,
  },
  teamsContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  teams: { flex: 1 },
  teamRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  flag: { fontSize: 24, width: 36 },
  teamName: { flex: 1, color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  scoreBox: { width: 30, alignItems: 'center' },
  scoreText: { color: '#64748b', fontSize: 18, fontWeight: '700' },
  scoreTextPlayed: { color: '#fff' },
  input: {
    width: 40, height: 36, backgroundColor: '#0f172a', color: '#fff',
    borderRadius: 8, borderWidth: 1.5, borderColor: '#22c55e',
    textAlign: 'center', fontSize: 17, fontWeight: '700', marginLeft: 8,
  },
  predBox: {
    width: 40, height: 36, backgroundColor: '#1e3a5f', borderRadius: 8,
    borderWidth: 1, borderColor: '#3b82f6', justifyContent: 'center',
    alignItems: 'center', marginLeft: 8,
  },
  predGreen: { backgroundColor: '#14532d', borderColor: '#22c55e' },
  predRed: { backgroundColor: '#450a0a', borderColor: '#ef4444' },
  predText: { color: '#e2e8f0', fontSize: 17, fontWeight: '700' },
  inputPlaceholder: { width: 40, height: 36, marginLeft: 8 },
  pointsBadge: {
    width: 54, borderRadius: 10, alignItems: 'center',
    paddingVertical: 8, marginLeft: 10,
  },
  badgeGreen: { backgroundColor: '#14532d' },
  badgeRed: { backgroundColor: '#450a0a' },
  pointsEmoji: { fontSize: 22, marginBottom: 2 },
  pointsLabel: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 18 },
  pointsPts: { color: '#86efac', fontSize: 10, fontWeight: '600' },
  footer: { color: '#475569', fontSize: 12, paddingHorizontal: 14, paddingBottom: 10 },
});
