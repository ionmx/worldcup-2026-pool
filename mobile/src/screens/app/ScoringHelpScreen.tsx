import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const scoreRules = [
  {
    points: '6',
    title: 'Resultado exacto',
    description: 'Acertás los goles de los dos equipos.',
    example: 'Pronóstico 2-1, resultado 2-1.',
    tone: 'gold' as const,
  },
  {
    points: '3',
    title: 'Resultado cercano',
    description: 'Acertás ganador o empate, y cada equipo queda a no más de 1 gol.',
    example: 'Pronóstico 2-1, resultado 1-0.',
    tone: 'green' as const,
  },
  {
    points: '2',
    title: 'Ganador o empate',
    description: 'Acertás quién gana, o que el partido termina empatado.',
    example: 'Pronóstico 3-1, resultado 1-0.',
    tone: 'blue' as const,
  },
  {
    points: '0',
    title: 'Resultado errado',
    description: 'No acertás ganador ni empate.',
    example: 'Pronóstico 1-0, resultado 0-1.',
    tone: 'red' as const,
  },
];

const examples = [
  { prediction: 'Argentina 2 - 1 México', result: 'Argentina 2 - 1 México', points: '+6 pts' },
  { prediction: 'Argentina 2 - 1 México', result: 'Argentina 1 - 0 México', points: '+3 pts' },
  { prediction: 'Argentina 3 - 1 México', result: 'Argentina 1 - 0 México', points: '+2 pts' },
  { prediction: 'Argentina 1 - 0 México', result: 'Argentina 0 - 1 México', points: '0 pts' },
];

const toneStyles = {
  gold: { badge: '#f59e0b', text: '#fef3c7' },
  green: { badge: '#22c55e', text: '#dcfce7' },
  blue: { badge: '#38bdf8', text: '#e0f2fe' },
  red: { badge: '#ef4444', text: '#fee2e2' },
};

export const ScoringHelpScreen: React.FC = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.title}>Sistema de puntos</Text>
    <Text style={styles.subtitle}>
      Los puntos se calculan cuando termina el partido. En eliminatorias, el resultado cuenta hasta el final del tiempo jugado; los penales solo suman bonus.
    </Text>

    <View style={styles.section}>
      {scoreRules.map((rule) => {
        const tone = toneStyles[rule.tone];
        return (
          <View key={rule.title} style={styles.ruleCard}>
            <View style={[styles.pointsBadge, { backgroundColor: tone.badge }]}>
              <Text style={styles.pointsNumber}>{rule.points}</Text>
              <Text style={styles.pointsLabel}>pts</Text>
            </View>
            <View style={styles.ruleCopy}>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
              <Text style={styles.ruleDescription}>{rule.description}</Text>
              <Text style={[styles.ruleExample, { color: tone.text }]}>{rule.example}</Text>
            </View>
          </View>
        );
      })}
    </View>

    <View style={styles.bonusCard}>
      <Text style={styles.bonusKicker}>Bonus eliminatorias</Text>
      <Text style={styles.bonusTitle}>+1 punto por penales</Text>
      <Text style={styles.bonusDescription}>
        Si pronosticás empate en un partido de eliminatoria, elegís quién avanza por penales. Si acertás ese ganador, sumás 1 punto extra.
      </Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Ejemplos rápidos</Text>
      {examples.map((item) => (
        <View key={`${item.prediction}-${item.result}`} style={styles.exampleRow}>
          <View style={styles.exampleCopy}>
            <Text style={styles.exampleLabel}>Pronóstico</Text>
            <Text style={styles.exampleText}>{item.prediction}</Text>
            <Text style={styles.exampleLabel}>Resultado</Text>
            <Text style={styles.exampleText}>{item.result}</Text>
          </View>
          <Text style={[styles.examplePoints, item.points === '0 pts' && styles.zeroPoints]}>{item.points}</Text>
        </View>
      ))}
    </View>

    <View style={styles.noteCard}>
      <Text style={styles.noteTitle}>Cierre de predicciones</Text>
      <Text style={styles.noteText}>
        Podés editar tu pronóstico hasta 10 minutos antes del inicio del partido.
      </Text>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 18, paddingBottom: 36 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 20 },
  section: { gap: 10, marginBottom: 18 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  ruleCard: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  pointsBadge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 58,
    justifyContent: 'center',
    marginRight: 14,
    width: 58,
  },
  pointsNumber: { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 26 },
  pointsLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '800' },
  ruleCopy: { flex: 1 },
  ruleTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  ruleDescription: { color: '#cbd5e1', fontSize: 14, lineHeight: 20 },
  ruleExample: { fontSize: 12, fontWeight: '700', marginTop: 6 },
  bonusCard: {
    backgroundColor: '#15303b',
    borderColor: '#22c55e',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  bonusKicker: { color: '#22c55e', fontSize: 12, fontWeight: '900', marginBottom: 4, textTransform: 'uppercase' },
  bonusTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  bonusDescription: { color: '#cbd5e1', fontSize: 14, lineHeight: 21 },
  exampleRow: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  exampleCopy: { flex: 1, marginRight: 12 },
  exampleLabel: { color: '#64748b', fontSize: 11, fontWeight: '800', marginTop: 4, textTransform: 'uppercase' },
  exampleText: { color: '#e2e8f0', fontSize: 14, fontWeight: '700', marginTop: 2 },
  examplePoints: { color: '#22c55e', fontSize: 17, fontWeight: '900' },
  zeroPoints: { color: '#ef4444' },
  noteCard: {
    backgroundColor: '#111827',
    borderColor: '#334155',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  noteTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 5 },
  noteText: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
});
