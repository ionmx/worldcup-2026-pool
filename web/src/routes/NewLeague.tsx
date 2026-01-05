import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppLayout,
  Card,
  Button,
  LinkButton,
  LeaguePicture,
} from '../components';
import { useAuth } from '../hooks';
import {
  checkSlugAvailable,
  createLeague,
  generateSlug,
  uploadLeagueImage,
} from '../services';

export const NewLeague = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState('');
  const [slugInput, setSlugInput] = React.useState('');
  const [slugStatus, setSlugStatus] = React.useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [description, setDescription] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-generate slug from name if user hasn't manually edited it
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  React.useEffect(() => {
    if (!slugManuallyEdited && name) {
      setSlugInput(generateSlug(name));
    }
  }, [name, slugManuallyEdited]);

  // Check slug availability
  React.useEffect(() => {
    const sanitizedSlug = generateSlug(slugInput);

    if (!sanitizedSlug) {
      setSlugStatus('idle');
      return;
    }

    if (sanitizedSlug.length < 2) {
      setSlugStatus('invalid');
      return;
    }

    setSlugStatus('checking');

    const checkAvailability = async () => {
      const isAvailable = await checkSlugAvailable(sanitizedSlug);
      setSlugStatus(isAvailable ? 'available' : 'taken');
    };

    const timeout = setTimeout(() => {
      void checkAvailability();
    }, 300);

    return () => clearTimeout(timeout);
  }, [slugInput]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (slugStatus === 'taken' || slugStatus === 'invalid') return;

    const finalSlug = generateSlug(slugInput);

    setSaving(true);
    setError(null);

    try {
      // Create the league
      const newLeague = await createLeague(name, user.uid, {
        slug: finalSlug,
        description: description || undefined,
      });

      // Upload image if selected
      if (selectedFile) {
        await uploadLeagueImage(newLeague.id, selectedFile);
      }

      void navigate(`/league/${newLeague.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create league');
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors';
  const labelClass = 'block text-white/70 text-sm mb-2';

  if (!user) {
    return (
      <AppLayout>
        <div className="pt-8 px-4 pb-8 max-w-md mx-auto">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Sign in required
            </h1>
            <p className="text-white/70">
              Please sign in to create a league.
            </p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="md:min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
              Create League
            </h1>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="flex flex-col gap-4"
            >
              {/* League Image */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <LeaguePicture
                    src={previewUrl}
                    name={name || 'New League'}
                    size="xl"
                    className="border-2 border-white/20"
                  />
                  {previewUrl && (
                    <Button
                      onClick={handleRemovePhoto}
                      className="absolute px-0! -top-1 -right-1 rounded-full w-8 h-8 backdrop-blur-lg border-none opacity-70 hover:opacity-100"
                      title="Remove"
                    >
                      <span className="text-sm">✕</span>
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="league-image-upload"
                />
                <label
                  htmlFor="league-image-upload"
                  className="text-sm text-white/60 hover:text-white cursor-pointer transition-colors"
                >
                  {previewUrl ? 'Change Image' : 'Add Image'}
                </label>
              </div>

              {/* League Name */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  League Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome League"
                  className={inputClass}
                  required
                />
              </div>

              {/* Slug / URL */}
              <div>
                <label htmlFor="slug" className={labelClass}>
                  URL
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 text-sm pointer-events-none">
                    /league/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={slugInput}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setSlugInput(
                        e.target.value.toLowerCase().replace(/\s+/g, '-')
                      );
                    }}
                    placeholder="league-url"
                    className={`${inputClass} pl-[72px] ${slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-400' : slugStatus === 'available' ? 'border-green-400' : ''}`}
                    required
                  />
                  {slugStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
                      Checking...
                    </span>
                  )}
                  {slugStatus === 'available' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 text-sm">
                      ✓ Available
                    </span>
                  )}
                  {slugStatus === 'taken' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">
                      ✗ Taken
                    </span>
                  )}
                  {slugStatus === 'invalid' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400 text-sm">
                      ✗ Too short
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this league about?"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 mt-4">
                <LinkButton
                  to="/leagues"
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </LinkButton>
                <Button
                  type="submit"
                  disabled={
                    saving ||
                    !name.trim() ||
                    !slugInput.trim() ||
                    slugStatus === 'taken' ||
                    slugStatus === 'invalid' ||
                    slugStatus === 'checking'
                  }
                  className="flex-1"
                >
                  {saving ? 'Creating...' : 'Create League'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

