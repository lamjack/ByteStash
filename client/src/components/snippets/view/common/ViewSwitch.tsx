import React from 'react';
import { Globe, Lock, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type StorageView = 'private' | 'public' | 'group';

interface ViewSwitchProps {
  value: StorageView;
  onChange: (value: StorageView) => void;
  // The group view needs a signed-in user
  showGroup?: boolean;
}

const OPTIONS: { value: StorageView; icon: typeof Lock; activeColor: string }[] = [
  { value: 'private', icon: Lock, activeColor: 'text-emerald-500' },
  { value: 'public', icon: Globe, activeColor: 'text-light-primary dark:text-dark-primary' },
  { value: 'group', icon: Users, activeColor: 'text-amber-500' },
];

const ViewSwitch: React.FC<ViewSwitchProps> = ({ value, onChange, showGroup = false }) => {
  const { t: translate } = useTranslation('components/snippets/view/common');

  return (
    <div className="flex items-center gap-3 text-sm text-light-text dark:text-dark-text w-full">
      <div
        className="flex gap-0.5 rounded-lg bg-light-surface dark:bg-dark-surface px-0.5 py-0.5 w-full"
        role="group"
      >
        {OPTIONS.filter((option) => showGroup || option.value !== 'group').map(({ value: option, icon: Icon, activeColor }) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              className={`
                flex items-center justify-center gap-1 px-2 py-0.5 rounded-md transition-all duration-200 flex-1
                ${selected
                  ? 'bg-light-hover dark:bg-dark-hover'
                  : 'hover:bg-light-hover/50 dark:hover:bg-dark-hover/50'
                }
              `}
            >
              <Icon
                className={`
                  stroke-[2] transition-colors duration-200
                  ${selected ? activeColor : 'text-light-text/50 dark:text-dark-text/50'}
                `}
                size={14}
              />
              <span className="text-xs font-medium">{translate(`viewSwitch.${option}`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ViewSwitch;
