import React from 'react';
import {
  AppLayout,
  MatchesByDay,
  MatchesByGroup,
  MatchesHeader,
} from '../components';
import { useMatches } from '../hooks';

type ViewMode = 'day' | 'group';

export const Home = () => {
  const { matches, loading, error } = useMatches();
  const [viewMode, setViewMode] = React.useState<ViewMode>('day');

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        <MatchesHeader viewMode={viewMode} onViewModeChange={setViewMode} />

        {/* Content */}
        {loading && (
          <div className="text-center text-white/70">Loading matches...</div>
        )}

        {error && (
          <div className="text-center text-red-400">Error: {error}</div>
        )}

        {matches &&
          (viewMode === 'day' ? (
            <MatchesByDay matches={matches} />
          ) : (
            <MatchesByGroup matches={matches} />
          ))}
      </div>
    </AppLayout>
  );
};
