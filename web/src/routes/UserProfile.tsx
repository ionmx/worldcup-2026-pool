import React from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer, NavBar, MatchesByDay, MatchesByGroup, Button } from '../components';
import { useMatches } from '../hooks';

type ViewMode = 'day' | 'group';

export const UserProfile = () => {
  const { userName } = useParams();
  const { matches, loading, error } = useMatches();
  const [viewMode, setViewMode] = React.useState<ViewMode>('group');

  return (
    <PageContainer className="relative">
      <NavBar />
      <div className="pt-20 px-4 pb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome, {userName}!</h1>

        {/* View Toggle */}
        <div className="flex justify-center gap-2 mb-6">
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
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center text-white/70">Loading matches...</div>
        )}

        {error && (
          <div className="text-center text-red-400">Error: {error}</div>
        )}

        {matches && (
          viewMode === 'day' ? (
            <MatchesByDay matches={matches} />
          ) : (
            <MatchesByGroup matches={matches} />
          )
        )}
      </div>
    </PageContainer>
  );
}

