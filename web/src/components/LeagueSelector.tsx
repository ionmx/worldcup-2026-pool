import React from 'react';
import { Link } from 'react-router-dom';
import { useLeague } from '../hooks';
import { useAuth } from '../hooks';

export const LeagueSelector = () => {
  const { user } = useAuth();
  const { leagues, selectedLeague, setSelectedLeague } = useLeague();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return null;
  }

  const displayName = selectedLeague?.name ?? 'Global';

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <span className="text-lg">{selectedLeague ? '🏅' : '🌍'}</span>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium text-sm truncate">
            {displayName}
          </div>
          <div className="text-white/50 text-xs">
            {selectedLeague ? 'League' : 'All Players'}
          </div>
        </div>
        <span
          className={`text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden z-50 shadow-xl">
          {/* Global option */}
          <button
            onClick={() => {
              setSelectedLeague(null);
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 transition-colors text-left ${
              !selectedLeague ? 'bg-white/10' : ''
            }`}
          >
            <span className="text-lg">🌍</span>
            <span className="text-white text-sm">Global</span>
            {!selectedLeague && (
              <span className="ml-auto text-white/50 text-xs">✓</span>
            )}
          </button>

          {/* Divider if has leagues */}
          {leagues.length > 0 && (
            <div className="border-t border-white/10 my-1" />
          )}

          {/* User's leagues */}
          {leagues.map((league) => (
            <button
              key={league.id}
              onClick={() => {
                setSelectedLeague(league);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 transition-colors text-left ${
                selectedLeague?.id === league.id ? 'bg-white/10' : ''
              }`}
            >
              <span className="text-lg">🏅</span>
              <span className="text-white text-sm truncate flex-1">
                {league.name}
              </span>
              {selectedLeague?.id === league.id && (
                <span className="text-white/50 text-xs">✓</span>
              )}
            </button>
          ))}

          {/* Manage leagues link */}
          <div className="border-t border-white/10 mt-1">
            <Link
              to="/leagues"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 hover:bg-white/10 transition-colors text-white/50 text-sm"
            >
              <span>⚙️</span>
              <span>Manage Leagues</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

