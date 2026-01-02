import {
  type Match,
  type MatchesData,
  type UserPredictions,
} from '../services';
import { MatchCard } from './MatchCard';

type MatchesByGroupProps = {
  matches: MatchesData;
  isOwnProfile?: boolean;
  userId?: string;
  predictions?: UserPredictions;
};

export const MatchesByGroup = ({
  matches,
  isOwnProfile,
  userId,
  predictions,
}: MatchesByGroupProps) => {
  // Group matches by group (or round if group is null)
  const groupedMatches = Object.values(matches).reduce<Record<string, Match[]>>(
    (acc, match) => {
      const groupKey = match.group ? `Group ${match.group}` : match.round;

      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(match);
      return acc;
    },
    {}
  );

  // Sort groups: A-L first, then knockout rounds
  const sortedGroups = Object.keys(groupedMatches).sort((a, b) => {
    const isGroupA = a.startsWith('Group ');
    const isGroupB = b.startsWith('Group ');

    if (isGroupA && isGroupB) {
      return a.localeCompare(b);
    }
    if (isGroupA) return -1;
    if (isGroupB) return 1;

    // Sort knockout rounds by first match timestamp
    const firstMatchA = groupedMatches[a][0];
    const firstMatchB = groupedMatches[b][0];
    return firstMatchA.timestamp - firstMatchB.timestamp;
  });

  return (
    <div className="flex flex-col gap-6">
      {sortedGroups.map((group) => (
        <div key={group}>
          <h3 className="text-lg font-semibold mb-3 text-white/80 pb-2">
            {group}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {groupedMatches[group]
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
