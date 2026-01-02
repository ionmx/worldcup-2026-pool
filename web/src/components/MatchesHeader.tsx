import { Chip } from './Chip';

type ViewMode = 'day' | 'group';

type MatchesHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  title?: string;
};

export const MatchesHeader = ({
  viewMode,
  onViewModeChange,
  title = 'Matches',
}: MatchesHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold">{title}</h2>
      <div className="flex gap-2">
        <Chip
          active={viewMode === 'day'}
          onClick={() => onViewModeChange('day')}
        >
          By Day
        </Chip>
        <Chip
          active={viewMode === 'group'}
          onClick={() => onViewModeChange('group')}
        >
          By Group
        </Chip>
      </div>
    </div>
  );
};
