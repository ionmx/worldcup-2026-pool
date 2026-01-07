import { Link } from 'react-router-dom';
import { useAuth } from '../hooks';
import { type UserWithId } from '../services';
import { ProfilePicture } from './ProfilePicture';

// Podium item component
const PodiumItem = ({
  user,
  position,
  height,
  isCurrentUser,
}: {
  user: UserWithId;
  position: number;
  height: string;
  isCurrentUser: boolean;
}) => (
  <Link
    to={`/${user.userName}`}
    className="flex flex-col items-center group border-b border-b-black/20"
  >
    <div className="relative mb-2">
      {/* Pulsing ring for current user */}
      {isCurrentUser && (
        <div
          className="absolute inset-0 -m-1.5 rounded-full border-3"
          style={{
            animation: 'ringPulse 2s ease-in-out infinite',
            borderColor:
              position === 1
                ? 'rgba(250,204,21,1)'
                : position === 2
                  ? 'rgba(203,213,225,1)'
                  : 'rgba(217,119,6,1)',
            boxShadow:
              position === 1
                ? '0 0 12px rgba(250,204,21,0.6)'
                : position === 2
                  ? '0 0 12px rgba(203,213,225,0.6)'
                  : '0 0 12px rgba(217,119,6,0.6)',
          }}
        />
      )}
      <style>{`
        @keyframes ringPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      {/* User info */}
      <ProfilePicture
        src={user.photoURL}
        name={user.displayName}
        size={position === 1 ? 'lg' : 'md'}
        className={`ring-4 ${
          position === 1
            ? 'ring-yellow-400/80 w-16! h-16! sm:w-20 sm:h-20'
            : position === 2
              ? 'ring-slate-300/80 w-10! h-10! sm:w-16! sm:h-16!'
              : 'ring-amber-600/80 w-10! h-10! sm:w-16! sm:h-16!'
        }`}
      />
      <span className="absolute -bottom-1 -right-2 text-2xl sm:text-3xl">
        {position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉'}
      </span>
    </div>
    <div className="w-22 sm:w-32 flex flex-col items-center overflow-hidden">
      <span className="text-white font-medium text-sm truncate w-full text-center">
        {user.displayName?.split(' ')[0]}
      </span>
      <span className="text-white/60 text-xs truncate w-full text-center">
        @{user.userName}
      </span>
      <span className="text-white font-bold mt-2 text-sm sm:text-lg">
        {user.score} pts
      </span>
    </div>
    {/* Elliptical shadow from object above */}
    <div className="w-10 h-2 rounded-full -mt-1 mb-1 z-20 blur-sm bg-black/80" />
    <div className="relative w-22 sm:w-32 opacity-80 group-hover:opacity-70 transition-opacity backdrop-blur-sm">
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
          className={`font-bold bg-linear-to-b from-white/70 to-white/10 bg-clip-text text-transparent ${position === 1 ? 'text-6xl' : position === 2 ? 'text-5xl' : 'text-4xl'}`}
        >
          {position}
        </span>
      </div>
    </div>
  </Link>
);

// Podium component for top 3
export const Podium = ({ users }: { users: UserWithId[] }) => {
  const { user: currentUser } = useAuth();

  if (users.length < 3) return null;

  const [first, second, third] = [users[0], users[1], users[2]];
  return (
    <div className="relative p-0!">
      <div className="relative z-10 flex items-end justify-center gap-0">
        <PodiumItem
          user={second}
          position={2}
          height="h-18 sm:h-20"
          isCurrentUser={currentUser?.uid === second.id}
        />
        <PodiumItem
          user={first}
          position={1}
          height="h-24 sm:h-28"
          isCurrentUser={currentUser?.uid === first.id}
        />
        <PodiumItem
          user={third}
          position={3}
          height="h-12 sm:h-16"
          isCurrentUser={currentUser?.uid === third.id}
        />
      </div>

      {/* 3D floor beneath podium */}
      <div
        className="w-full mx-auto h-10 bg-white/5 backdrop-blur-sm -mt-7 z-0"
        style={{
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
        }}
      />
      {/* Shadow under podium */}
      <div className="w-70 sm:w-100 mx-auto h-4 rounded-full bg-black/20 blur-xs backdrop-blur-sm -mt-5 z-0" />
    </div>
  );
};
