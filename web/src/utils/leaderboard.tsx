import React from 'react';

export const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export const getMedalOrPosition = (position: number): React.ReactNode => {
  const medals = ['🥇', '🥈', '🥉'];
  const ordinal = (
    <>
      {position}
      <sup className="text-[10px]">{getOrdinalSuffix(position)}</sup>
    </>
  );

  if (position <= 3) {
    return (
      <>
        {medals[position - 1]} {ordinal}
      </>
    );
  }

  return <span className="text-white/50 font-medium">{ordinal}</span>;
};

/** Compact version for leaderboard list - medal only for top 3 */
export const getPositionCompact = (position: number): React.ReactNode => {
  if (position <= 3) {
    return <>{['🥇', '🥈', '🥉'][position - 1]}</>;
  }
  return (
    <span className="text-white/50 font-medium">
      {position}
      <sup className="text-[10px]">{getOrdinalSuffix(position)}</sup>
    </span>
  );
};

/** Returns Tailwind color class for position (gold, silver, bronze) */
export const getPositionColor = (position: number): string => {
  switch (position) {
    case 1:
      return 'text-yellow-400';
    case 2:
      return 'text-gray-300';
    case 3:
      return 'text-amber-600';
    default:
      return 'text-white/70';
  }
};
