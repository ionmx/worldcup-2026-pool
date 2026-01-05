type Size = 'sm' | 'md' | 'lg' | 'xl';

type LeaguePictureProps = {
  src?: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
};

const sizeClasses: Record<Size, { container: string; emoji: string }> = {
  sm: { container: 'w-10 h-10', emoji: 'text-xl' },
  md: { container: 'w-16 h-16', emoji: 'text-2xl' },
  lg: { container: 'w-20 h-20', emoji: 'text-3xl' },
  xl: { container: 'w-24 h-24', emoji: 'text-4xl' },
};

export const LeaguePicture = ({
  src,
  name,
  size = 'md',
  className = '',
}: LeaguePictureProps) => {
  const { container, emoji } = sizeClasses[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'League'}
        className={`${container} rounded-xl object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${container} rounded-xl bg-white/10 flex items-center justify-center ${emoji} ${className}`}
    >
      🏆
    </div>
  );
};
