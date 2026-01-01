import { type Match } from '../services';
import { Card } from './Card';

type MatchCardProps = {
  match: Match;
};

export const MatchCard = ({ match }: MatchCardProps) => {
  const matchDate = new Date(match.date);
  const timeString = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isPlayed = match.homeScore >= 0 && match.awayScore >= 0;

  return (
    <Card className="flex items-center justify-between p-4 hover:bg-white/10 transition-colors after:hidden">
      <div className="flex-1 text-right">
        <span className="font-medium">{match.homeName}</span>
        <span className="ml-2 text-xs text-white/50">{match.home}</span>
      </div>

      <div className="px-6 text-center min-w-[100px]">
        {isPlayed ? (
          <div className="text-xl font-bold">
            {match.homeScore} - {match.awayScore}
          </div>
        ) : (
          <div className="text-white/70">{timeString}</div>
        )}
        <div className="text-xs text-white/40">{match.location}</div>
      </div>

      <div className="flex-1 text-left">
        <span className="text-xs text-white/50 mr-2">{match.away}</span>
        <span className="font-medium">{match.awayName}</span>
      </div>
    </Card>
  );
};

