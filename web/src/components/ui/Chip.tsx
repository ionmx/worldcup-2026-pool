type ChipProps = {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

export const Chip = ({ active = false, onClick, children }: ChipProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
        active
          ? 'bg-white text-black'
          : 'bg-white/10 text-white/70 hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );
};
