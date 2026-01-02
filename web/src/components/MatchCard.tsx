import React from 'react';
import { type Match, type Prediction, savePrediction } from '../services';
import { Card } from './Card';

type MatchCardProps = {
  match: Match;
  isOwnProfile?: boolean;
  userId?: string;
  prediction?: Prediction;
};

export const MatchCard = ({ match, isOwnProfile = false, userId, prediction }: MatchCardProps) => {
  const matchDate = new Date(match.date);
  const timeString = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const inputClass = "w-12 h-8 text-center bg-white/10 border border-white/20 rounded text-white text-lg font-bold focus:outline-none focus:border-white/40 disabled:opacity-50";

  return (
    <Card className="flex items-center justify-between p-4 hover:bg-white/10 transition-colors after:hidden">
      <div className="flex-1 text-right flex items-center justify-end gap-2">
        <div>
          <span className="font-medium">{match.homeName}</span>
          <span className="ml-2 text-xs text-white/50">{match.home}</span>
        </div>
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
          <span className="w-12 h-8 flex items-center justify-center bg-blue-600/30 border border-blue-400/30 rounded text-lg font-bold">
            {prediction.homePrediction}
          </span>
        )}
      </div>

      <div className="px-4 text-center min-w-[80px]">
        {isPlayed ? (
          <div className="text-xl font-bold">
            {match.homeScore} - {match.awayScore}
          </div>
        ) : (
          <div className="text-white/70 text-sm">{timeString}</div>
        )}
        <div className="text-xs text-white/40 truncate max-w-[120px]">{match.location}</div>
        {prediction && prediction.points > 0 && (
          <div className="text-xs text-green-400 font-medium">+{prediction.points} pts</div>
        )}
      </div>

      <div className="flex-1 text-left flex items-center gap-2">
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
          <span className="w-12 h-8 flex items-center justify-center bg-blue-600/30 border border-blue-400/30 rounded text-lg font-bold">
            {prediction.awayPrediction}
          </span>
        )}
        <div>
          <span className="text-xs text-white/50 mr-2">{match.away}</span>
          <span className="font-medium">{match.awayName}</span>
        </div>
      </div>
    </Card>
  );
};

