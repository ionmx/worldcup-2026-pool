type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type ProfilePictureProps = {
  src?: string | null;
  name?: string | null;
  size?: Size;
  className?: string;
};

const sizeClasses: Record<Size, { container: string; text: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-xs' },
  sm: { container: 'w-10 h-10', text: 'text-sm' },
  md: { container: 'w-16 h-16', text: 'text-2xl' },
  lg: { container: 'w-20 h-20', text: 'text-3xl' },
  xl: { container: 'w-24 h-24', text: 'text-3xl' },
};

export const ProfilePicture = ({
  src,
  name,
  size = 'md',
  className = '',
}: ProfilePictureProps) => {
  const { container, text } = sizeClasses[size];
  const initial = name?.charAt(0) ?? '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'Profile'}
        className={`${container} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-blue-600 flex items-center justify-center ${text} font-bold ${className}`}
    >
      {initial}
    </div>
  );
};
