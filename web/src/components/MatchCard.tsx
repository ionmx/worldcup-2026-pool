import React from 'react';
import { type Match, type Prediction, savePrediction } from '../services';
import { Card } from './Card';

// Import all flags dynamically
const flagModules: Record<string, string> = import.meta.glob(
  '../assets/flags/*.png',
  { eager: true, import: 'default' }
);

const getFlag = (code: string): string => {
  return (
    flagModules[`../assets/flags/${code}.png`] ??
    flagModules['../assets/flags/UNKNOWN.png']
  );
};

type MatchCardProps = {
  match: Match;
  isOwnProfile?: boolean;
  userId?: string;
  prediction?: Prediction;
};

export const MatchCard = ({
  match,
  isOwnProfile = false,
  userId,
  prediction,
}: MatchCardProps) => {
  const matchDate = new Date(match.date);
  const timeString = matchDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;
  const hasStarted = Date.now() > match.timestamp * 1000;
  const canPredict = isOwnProfile && userId && !hasStarted;

  const [homePrediction, setHomePrediction] = React.useState<string>(
    prediction?.homePrediction?.toString() ?? ''
  );
  const [awayPrediction, setAwayPrediction] = React.useState<string>(
    prediction?.awayPrediction?.toString() ?? ''
  );
  const [saving, setSaving] = React.useState(false);

  // Update local state when prediction prop changes
  React.useEffect(() => {
    if (prediction) {
      setHomePrediction(prediction.homePrediction?.toString() ?? '');
      setAwayPrediction(prediction.awayPrediction?.toString() ?? '');
    }
  }, [prediction]);

  const handleSavePrediction = async () => {
    if (!userId || !canPredict) return;

    const home = parseInt(homePrediction, 10);
    const away = parseInt(awayPrediction, 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) return;

    setSaving(true);
    try {
      await savePrediction(userId, match.game, home, away);
    } catch (error) {
      console.error('Error saving prediction:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = () => {
    if (homePrediction !== '' && awayPrediction !== '') {
      void handleSavePrediction();
    }
  };

  const inputClass =
    'w-10 h-8 text-center bg-white/10 border border-white/20 rounded text-white text-lg font-bold focus:outline-none focus:border-white/40 disabled:opacity-50';
  const scoreClass =
    'w-10 h-8 flex items-center justify-center text-lg font-bold';
  const predictionClass =
    'w-10 h-8 flex items-center justify-center bg-blue-600/30 border border-blue-400/30 rounded text-lg font-bold';

  const dateString = matchDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  const showPoints = isPlayed && prediction;

  return (
    <Card className="p-4 hover:bg-white/10 transition-colors after:hidden">
      {/* Teams and Points Row */}
      <div className="flex gap-3 mb-3">
        {/* Team Rows */}
        <div className="flex-1">
          {/* Home Team Row */}
          <div className="flex items-center gap-3 mb-2">
            <img
              src={getFlag(match.home)}
              alt={match.home}
              className="h-8 w-12 object-contain"
            />
            <span className="flex-1 font-medium">{match.homeName}</span>
            {isPlayed && <span className={scoreClass}>{match.homeScore}</span>}
            {canPredict && (
              <input
                type="number"
                min="0"
                max="99"
                value={homePrediction}
                onChange={(e) => setHomePrediction(e.target.value)}
                onBlur={handleBlur}
                className={inputClass}
                disabled={saving}
                placeholder="-"
              />
            )}
            {!canPredict && prediction && (
              <span className={predictionClass}>
                {prediction.homePrediction}
              </span>
            )}
          </div>

          {/* Away Team Row */}
          <div className="flex items-center gap-3">
            <img
              src={getFlag(match.away)}
              alt={match.away}
              className="h-8 w-12 object-contain"
            />
            <span className="flex-1 font-medium">{match.awayName}</span>
            {isPlayed && <span className={scoreClass}>{match.awayScore}</span>}
            {canPredict && (
              <input
                type="number"
                min="0"
                max="99"
                value={awayPrediction}
                onChange={(e) => setAwayPrediction(e.target.value)}
                onBlur={handleBlur}
                className={inputClass}
                disabled={saving}
                placeholder="-"
              />
            )}
            {!canPredict && prediction && (
              <span className={predictionClass}>
                {prediction.awayPrediction}
              </span>
            )}
          </div>
        </div>

        {/* Points Column */}
        {showPoints && (
          <div
            className={`flex flex-col items-center border rounded-lg ${
              prediction.points > 0
                ? 'border-green-500/20 bg-green-600/10'
                : 'border-red-500/20 bg-red-600/10'
            }`}
          >
            <span className="flex-1 flex items-center text-2xl">
              {prediction.points === 15
                ? '🥳'
                : prediction.points > 0
                  ? '😄'
                  : '😔'}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-b ${
                prediction.points > 0
                  ? 'bg-green-800 text-white'
                  : 'bg-red-800 text-white'
              }`}
            >
              {prediction.points > 0
                ? `+${prediction.points}`
                : prediction.points}{' '}
              pts
            </span>
          </div>
        )}
      </div>

      {/* Footer: Group, Stadium, Date/Time */}
      <div className="flex items-center gap-2 text-xs text-white/50">
        {match.group && <span>Group: {match.group}</span>}
        {match.group && <span>·</span>}
        <span className="truncate">
          {match.locationCity}, {match.locationCountry}
        </span>
        <span>·</span>
        <span>
          {dateString}, {timeString}
        </span>
      </div>
    </Card>
  );
};
