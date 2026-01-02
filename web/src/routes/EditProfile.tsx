import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppLayout,
  Card,
  Button,
  LinkButton,
  ProfilePicture,
} from '../components';
import { useAuth } from '../hooks/useAuth';
import {
  checkUsernameAvailable,
  sanitizeUsername,
  updateUserProfile,
  uploadProfilePicture,
} from '../services';

export const EditProfile = () => {
  const navigate = useNavigate();
  const { user, userData, setUserData } = useAuth();
  const [userName, setUserName] = React.useState(userData?.userName ?? '');
  const [displayName, setDisplayName] = React.useState(
    userData?.displayName ?? ''
  );
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const originalUserName = userData?.userName ?? '';

  // Sync form state when userData changes (e.g., new user signs in)
  React.useEffect(() => {
    setUserName(userData?.userName ?? '');
    setDisplayName(userData?.displayName ?? '');
  }, [userData?.userName, userData?.displayName]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (usernameStatus === 'taken') return;

    // Sanitize username before saving (removes trailing dots)
    const finalUserName = sanitizeUsername(userName);

    setSaving(true);
    setError(null);

    try {
      let newPhotoURL = userData?.photoURL ?? '';

      // Upload new profile picture if selected
      if (selectedFile) {
        newPhotoURL = await uploadProfilePicture(user.uid, selectedFile);
      }

      await updateUserProfile(
        user.uid,
        { userName: finalUserName, displayName },
        originalUserName
      );

      if (userData) {
        setUserData({
          ...userData,
          userName: finalUserName,
          displayName,
          photoURL: newPhotoURL,
        });
      }
      void navigate(`/${finalUserName}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setSaving(false);
    }
  };

  const isFormValid =
    userName.length >= 3 &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'checking';

  const inputClass =
    'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors';
  const labelClass = 'block text-white/70 text-sm mb-2';

  return (
    <AppLayout className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Edit Profile
        </h1>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-4"
        >
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <ProfilePicture
                src={previewUrl ?? userData?.photoURL}
                name={userData?.displayName}
                size="xl"
                className="border-2 border-white/20"
              />
              {previewUrl && (
                <Button
                  onClick={handleRemovePhoto}
                  className="absolute px-0! -top-1 -right-1 rounded-full w-8 h-8 backdrop-blur-lg border-none opacity-70 hover:opacity-100"
                  title="Undo"
                >
                  <span className="text-sm">↩️</span>
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="text-sm text-white/60 hover:text-white cursor-pointer transition-colors"
            >
              Change Photo
            </label>
          </div>

          <div>
            <label htmlFor="displayName" className={labelClass}>
              Display Name
            </label>
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
            <label htmlFor="userName" className={labelClass}>
              Username
            </label>
            <div className="relative">
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) =>
                  setUserName(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9._-]/g, '')
                      .replace(/^\./, '')
                      .replace(/\.{2,}/g, '.')
                  )
                }
                onBlur={(e) => setUserName(sanitizeUsername(e.target.value))}
                placeholder="your-username"
                className={`${inputClass} ${usernameStatus === 'taken' ? 'border-red-400' : usernameStatus === 'available' ? 'border-green-400' : ''}`}
                required
                minLength={3}
              />
              {usernameStatus === 'checking' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
                  Checking...
                </span>
              )}
              {usernameStatus === 'available' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">
                  ✓ Available
                </span>
              )}
              {usernameStatus === 'taken' && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">
                  ✗ Taken
                </span>
              )}
            </div>
            <p className="text-white/50 text-xs mt-1">
              Letters, numbers, periods, hyphens, and underscores only.
            </p>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 mt-4">
            <LinkButton
              to={`/${userData?.userName ?? ''}`}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </LinkButton>
            <Button
              type="submit"
              disabled={saving || !isFormValid}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
};
