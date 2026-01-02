import React from 'react';
import { AppLayout, MatchesByDay, MatchesByGroup, Button } from '../components';
import { useMatches } from '../hooks';

type ViewMode = 'day' | 'group';

export const Home = () => {
  const { matches, loading, error } = useMatches();
  const [viewMode, setViewMode] = React.useState<ViewMode>('day');

  return (
    <AppLayout>
      <div className="pt-8 px-4 pb-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Matches</h1>

          {/* View Toggle */}
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-full transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-black!'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              By Day
            </Button>
            <Button
              onClick={() => setViewMode('group')}
              className={`px-4 py-2 rounded-full transition-colors ${
                viewMode === 'group'
                  ? 'bg-white text-black!'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              By Group
            </Button>
          </div>
        </div>

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
