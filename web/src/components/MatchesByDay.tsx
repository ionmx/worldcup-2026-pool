import {
  type Match,
  type MatchesData,
  type UserPredictions,
} from '../services';
import { MatchCard } from './MatchCard';

type MatchesByDayProps = {
  matches: MatchesData;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: UserPredictions;
};

export const MatchesByDay = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
}: MatchesByDayProps) => {
  // Group matches by date (day)
  const groupedByDay = Object.values(matches).reduce<Record<string, Match[]>>(
    (acc, match) => {
      const date = new Date(match.date);
      const dayKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(match);
      return acc;
    },
    {}
  );

  // Sort days chronologically
  const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
    const dateA = new Date(groupedByDay[a][0].date);
    const dateB = new Date(groupedByDay[b][0].date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="flex flex-col gap-6">
      {sortedDays.map((day) => (
        <div key={day}>
          <h3 className="text-lg font-semibold mb-3 text-white/80 pb-2">
            {day}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedByDay[day]
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((match) => (
                <MatchCard
                  key={match.game}
                  match={match}
                  isOwnProfile={isOwnProfile}
                  userId={userId}
                  prediction={predictions?.[match.game]}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
