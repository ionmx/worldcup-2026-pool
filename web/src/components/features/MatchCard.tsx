import React from 'react';
import { type Match, type Prediction, savePrediction } from '../../services';
import { Card } from '../ui/Card';

// Import all flags dynamically
const flagModules: Record<string, string> = import.meta.glob(
  '../../assets/flags/*.png',
  { eager: true, import: 'default' }
);

const getFlag = (code: string): string => {
  return (
    flagModules[`../../assets/flags/${code}.png`] ??
    flagModules['../../assets/flags/UNKNOWN.png']
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
  const cutoffTime = match.timestamp * 1000 - 10 * 60 * 1000; // 10 mins before kickoff
  const predictionsClosed = Date.now() > cutoffTime;

  // Match is live if it started but hasn't finished (assume ~2.5 hours for a full match)
  // TODO: Implement this properly (check FIFA API)
  const kickoffTime = match.timestamp * 1000;
  const matchEndEstimate = kickoffTime + 150 * 60 * 1000; // 2.5 hours after kickoff
  const isLive =
    !isPlayed && Date.now() >= kickoffTime && Date.now() < matchEndEstimate;
  const canPredict = isOwnProfile && userId && !predictionsClosed;

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
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <img
              src={getFlag(match.home)}
              alt={match.home}
              className="h-6 w-9 md:h-8 md:w-12 object-contain rounded-sm"
            />
            <span className="flex-1 font-medium text-sm md:text-base">
              {match.homeName}
            </span>
            <span className={scoreClass}>
              {isPlayed ? match.homeScore : '-'}
            </span>
            {canPredict && (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={homePrediction}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setHomePrediction(val);
                }}
                onFocus={(e) => e.target.select()}
                onBlur={handleBlur}
                className={inputClass}
                disabled={saving}
                placeholder="-"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
              />
            )}
            {!canPredict && prediction && (
              <span className={predictionClass}>
                {prediction.homePrediction}
              </span>
            )}
          </div>

          {/* Away Team Row */}
          <div className="flex items-center gap-2 md:gap-3">
            <img
              src={getFlag(match.away)}
              alt={match.away}
              className="h-6 w-9 md:h-8 md:w-12 object-contain rounded-sm"
            />
            <span className="flex-1 font-medium text-sm md:text-base">
              {match.awayName}
            </span>
            <span className={scoreClass}>
              {isPlayed ? match.awayScore : '-'}
            </span>
            {canPredict && (
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={awayPrediction}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setAwayPrediction(val);
                }}
                onFocus={(e) => e.target.select()}
                onBlur={handleBlur}
                className={inputClass}
                disabled={saving}
                placeholder="-"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-form-type="other"
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
            className={`flex flex-col items-center border rounded-lg w-14 ${
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
              className={`flex items-center justify-center text-xs px-1 py-0.5 w-14 rounded-b ${
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
        {isLive && (
          <span className="ml-auto flex items-center gap-1.5 text-red-500 font-bold animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            LIVE
          </span>
        )}
      </div>
    </Card>
  );
};
