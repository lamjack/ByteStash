import React, { useState } from 'react';
import { Check, Code } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { basePath } from '../../../utils/api/basePath';

export interface RawButtonProps {
  isPublicView: boolean;
  snippetId: string;
  fragmentId: string;
}

const RawButton: React.FC<RawButtonProps> = ({ isPublicView, snippetId, fragmentId }) => {
  const { t: translate } = useTranslation('components/common/buttons');
  const [isOpenRaw, setIsOpenRaw] = useState(false);
  const title = translate('rawButton.title');

  const handleOpenRaw = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isPublicView) {
        window.open(`${basePath}/api/public/snippets/${snippetId}/${fragmentId}/raw`, '_blank');
      } else {
        window.open(`${basePath}/api/snippets/${snippetId}/${fragmentId}/raw`, '_blank');
      }
    } catch (err) {
      console.error('Failed to open raw: ', err);
    }
      
    setIsOpenRaw(true);
    setTimeout(() => setIsOpenRaw(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleOpenRaw}
      className="flex h-9 w-9 items-center justify-center rounded-md bg-light-surface dark:bg-dark-surface hover:bg-light-hover dark:hover:bg-dark-hover transition-colors text-light-text dark:text-dark-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary"
      aria-label={title}
      title={title}
    >
      {isOpenRaw ? (
        <Check size={16} className="text-light-primary dark:text-dark-primary" />
      ) : (
        <Code size={16} className="text-light-text dark:text-dark-text" />
      )}
    </button>
  );
};

export default RawButton;