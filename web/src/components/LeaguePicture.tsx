type Size = 'sm' | 'md' | 'lg' | 'xl';

type LeaguePictureProps = {
  src?: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
};

const sizeClasses: Record<
  Size,
  { container: string; emoji: string; text: string }
> = {
  sm: { container: 'w-10 h-10', emoji: 'text-lg', text: 'text-[8px]' },
  md: { container: 'w-16 h-16', emoji: 'text-xl', text: 'text-[10px]' },
  lg: { container: 'w-20 h-20', emoji: 'text-2xl', text: 'text-xs' },
  xl: { container: 'w-24 h-24', emoji: 'text-3xl', text: 'text-sm' },
};

export const LeaguePicture = ({
  src,
  name,
  size = 'md',
  className = '',
}: LeaguePictureProps) => {
  const { container, emoji, text } = sizeClasses[size];

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
      className={`${container} rounded-xl bg-white/10 flex flex-col items-center justify-center gap-0.5 ${className}`}
    >
      <span className={emoji}>🏆</span>
      {name && (
        <span
          className={`${text} text-white/70 text-center leading-tight line-clamp-2 px-1`}
        >
          {name}
        </span>
      )}
    </div>
  );
};
