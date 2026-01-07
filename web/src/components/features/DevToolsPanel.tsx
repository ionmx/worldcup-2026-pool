import React from 'react';
import { useAuth } from '../../hooks';
import {
  generateMockUsers,
  clearMockUsers,
  getMockUserCount,
} from '../../services/devService';
import { Button } from '../ui/Button';

export const DevToolsPanel = () => {
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<string | null>(null);
  const [mockCount, setMockCount] = React.useState(0);
  const [message, setMessage] = React.useState<string | null>(null);

  // Only show in dev mode AND for admin users
  const shouldShow = import.meta.env.DEV && userData?.admin;

  // Load mock user count on open
  React.useEffect(() => {
    if (isOpen) {
      void getMockUserCount().then(setMockCount);
    }
  }, [isOpen]);

  // Clear message after 3 seconds
  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!shouldShow) return null;

  const handleAction = async (
    action: () => Promise<number>,
    actionName: string,
    successMessage: (count: number) => string
  ) => {
    setLoading(actionName);
    try {
      const count = await action();
      setMessage(successMessage(count));
      // Refresh mock count
      const newCount = await getMockUserCount();
      setMockCount(newCount);
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 sm:bottom-4 z-50 w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg flex items-center justify-center transition-colors hover:cursor-pointer"
        title="Dev Tools"
      >
        🛠️
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 sm:bottom-20 z-50 w-72 bg-black/10 backdrop-blur-sm border border-yellow-500/50 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-yellow-500 px-4 py-2 flex items-center justify-between">
            <span className="font-bold text-black">🛠️ Dev Tools</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-black/70 hover:text-black hover:cursor-pointer"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Mock user count */}
            <div className="text-sm text-white/70">
              Mock users in DB:{' '}
              <span className="text-white font-bold">{mockCount}</span>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={() =>
                  void handleAction(
                    () => generateMockUsers(5),
                    'generate',
                    (n) => `Created ${n} mock users with predictions`
                  )
                }
                disabled={loading !== null}
                className="w-full text-sm"
              >
                {loading === 'generate' ? 'Creating...' : '➕ Add 5 Mock Users'}
              </Button>

              <Button
                onClick={() =>
                  void handleAction(
                    clearMockUsers,
                    'clear',
                    (n) => `Removed ${n} mock users`
                  )
                }
                disabled={loading !== null || mockCount === 0}
                variant="secondary"
                className="w-full text-sm text-red-400 hover:text-red-300"
              >
                {loading === 'clear' ? 'Clearing...' : '🗑️ Clear Mock Users'}
              </Button>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`text-sm p-2 rounded ${
                  message.startsWith('Error')
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                }`}
              >
                {message}
              </div>
            )}

            {/* Warning */}
            <div className="text-xs text-yellow-500/70 mt-4 mb-2 text-center">
              ⚠️ Only visible in dev mode for admins
            </div>
          </div>
        </div>
      )}
    </>
  );
};
