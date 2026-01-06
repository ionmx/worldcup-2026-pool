import { Link } from 'react-router-dom';
import { type UserWithId } from '../services';
import { ProfilePicture } from './ProfilePicture';

// Podium item component
const PodiumItem = ({
  user,
  position,
  height,
}: {
  user: UserWithId;
  position: number;
  height: string;
}) => (
  <Link
    to={`/${user.userName}`}
    className="flex flex-col items-center group border-b border-b-black/20"
  >
    <div className="relative mb-2">
      <ProfilePicture
        src={user.photoURL}
        name={user.displayName}
        size={position === 1 ? 'lg' : 'md'}
        className={`ring-4 ${
          position === 1
            ? 'ring-yellow-400/80'
            : position === 2
              ? 'ring-slate-300/80'
              : 'ring-amber-600/80'
        }`}
      />
      <span className="absolute -bottom-1 -right-2 text-3xl">
        {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
      </span>
    </div>
    <span className="text-white font-medium text-sm truncate max-w-24 text-center">
      {user.displayName}
    </span>
    <span className="text-white/60 text-xs">@{user.userName}</span>
    <span className="text-white font-bold mt-2">{user.score} pts</span>
    {/* Elliptical shadow from object above */}
    <div className="w-10 h-2 rounded-full -mt-1 mb-1 z-20 blur-sm bg-black/80" />
    <div className="relative w-32 opacity-80 group-hover:opacity-70 transition-opacity backdrop-blur-sm">
      {/* 3D top face */}
      <div
        className="absolute -top-4 inset-x-0 h-4 bg-white/25 backdrop-blur-sm"
        style={{
          clipPath:
            position === 1
              ? 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)'
              : position === 2
                ? 'polygon(15% 0%, 100% 0%, 100% 100%, 0% 100%)'
                : 'polygon(0% 0%, 85% 0%, 100% 100%, 0% 100%)',
        }}
      />
      {/* Front face */}
      <div
        className={`${height} flex items-center backdrop-blur-lg justify-center border-x border-white/5`}
        style={{
          background:
            position === 1
              ? 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.3) 100%)'
              : 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.25) 100%)',
        }}
      >
        <span
          className={`font-bold text-white/70 ${position === 1 ? 'text-6xl' : position === 2 ? 'text-5xl' : 'text-4xl'}`}
        >
          {position}
        </span>
      </div>
    </div>
  </Link>
);

// Podium component for top 3
export const Podium = ({ users }: { users: UserWithId[] }) => {
  if (users.length < 3) return null;

  const [first, second, third] = [users[0], users[1], users[2]];

  return (
    <div className="relative p-0!">
      <div className="relative z-10 flex items-end justify-center gap-0">
        <PodiumItem user={second} position={2} height="h-20" />
        <PodiumItem user={first} position={1} height="h-28" />
        <PodiumItem user={third} position={3} height="h-16" />
      </div>
      <div className="w-99 sm:w-102 mx-auto h-4 rounded-full bg-black/30 sm:bg-black/50 blur-xs backdrop-blur-sm -mt-3 z-0" />
      {/* 3D floor beneath podium */}
      <div
        className="w-[98%] mx-auto h-10 bg-white/5 backdrop-blur-sm -mt-7 z-0"
        style={{
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
        }}
      />
    </div>
  );
};
