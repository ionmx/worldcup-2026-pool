import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, NavBar, Card, Button } from '../components';
import { useAuth } from '../hooks/useAuth';
import { checkUsernameAvailable, sanitizeUsername, updateUserProfile } from '../services';

export const EditProfile = () => {
  const navigate = useNavigate();
  const { user, userData, setUserData } = useAuth();
  const [userName, setUserName] = React.useState(userData?.userName ?? '');
  const [displayName, setDisplayName] = React.useState(userData?.displayName ?? '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = React.useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const originalUserName = userData?.userName ?? '';

  // Debounced username availability check
  React.useEffect(() => {
    if (userName === originalUserName) {
      setUsernameStatus('idle');
      return;
    }

    if (userName.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');

    const timeoutId = setTimeout(() => {
      checkUsernameAvailable(userName, user?.uid)
        .then((available) => {
          setUsernameStatus(available ? 'available' : 'taken');
        })
        .catch(() => {
          setUsernameStatus('idle');
        });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [userName, originalUserName, user?.uid]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (usernameStatus === 'taken') return;

    // Sanitize username before saving (removes trailing dots)
    const finalUserName = sanitizeUsername(userName);

    setSaving(true);
    setError(null);

    updateUserProfile(user.uid, { userName: finalUserName, displayName }, originalUserName)
      .then(() => {
        if (userData) {
          setUserData({ ...userData, userName: finalUserName, displayName });
        }
        void navigate(`/${finalUserName}`);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        setSaving(false);
      });
  };

  const isFormValid = userName.length >= 3 && usernameStatus !== 'taken' && usernameStatus !== 'checking';

  const inputClass = "w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors";
  const labelClass = "block text-white/70 text-sm mb-2";

  return (
    <PageContainer className="flex flex-col items-center justify-center relative">
      <NavBar />
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="displayName" className={labelClass}>Display Name</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="userName" className={labelClass}>Username</label>
            <div className="relative">
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, '').replace(/^\./, '').replace(/\.{2,}/g, '.'))}
                onBlur={(e) => setUserName(sanitizeUsername(e.target.value))}
                placeholder="your-username"
                className={`${inputClass} ${usernameStatus === 'taken' ? 'border-red-400' : usernameStatus === 'available' ? 'border-green-400' : ''}`}
                required
                minLength={3}
              />
              {usernameStatus === 'checking' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">Checking...</span>
              )}
              {usernameStatus === 'available' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">✓ Available</span>
              )}
              {usernameStatus === 'taken' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">✗ Taken</span>
              )}
            </div>
            <p className="text-white/50 text-xs mt-1">Letters, numbers, periods, hyphens, and underscores only.</p>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              onClick={() => void navigate(-1)}
              className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !isFormValid}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white transition-colors cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
};

