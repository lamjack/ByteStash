import React from 'react';
import { Camera as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ExportImageButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const ExportImageButton: React.FC<ExportImageButtonProps> = ({ onClick }) => {
  const { t } = useTranslation('components/common/buttons');
  const title = t('exportButton.tooltip');

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-md bg-light-surface dark:bg-dark-surface hover:bg-light-hover dark:hover:bg-dark-hover transition-colors text-light-text dark:text-dark-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary"
      aria-label={title}
      title={title}
    >
      <ImageIcon size={16} className="text-light-text dark:text-dark-text" />
    </button>
  );
};

export default ExportImageButton;
