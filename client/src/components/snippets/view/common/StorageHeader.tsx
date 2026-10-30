import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../../constants/routes';
import { AppHeader } from '../../../common/layout/AppHeader';
import ViewSwitch, { type StorageView } from './ViewSwitch';
import { useAuth } from '../../../../hooks/useAuth';

interface StorageHeaderProps {
  isPublicView: boolean;
  isGroupView?: boolean;
}

const VIEW_ROUTES: Record<StorageView, string> = {
  private: ROUTES.HOME,
  public: ROUTES.PUBLIC_SNIPPETS,
  group: ROUTES.GROUP_SNIPPETS,
};

const StorageHeader: React.FC<StorageHeaderProps> = ({ isPublicView, isGroupView = false }) => {
  const { isAuthenticated } = useAuth();
  const view: StorageView = isGroupView ? 'group' : isPublicView ? 'public' : 'private';
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const navigate = useNavigate();
  const { t: translate } = useTranslation('components/snippets/view/common');

  const tooltipText = translate(`storageHeader.${view}`);

  return (
    <AppHeader>
      <div
        className="relative inline-block"
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
      >
        <ViewSwitch value={view} onChange={(next) => navigate(VIEW_ROUTES[next])} showGroup={isAuthenticated} />

        {isTooltipVisible && (
          <div
            className="absolute left-1/2 top-full mt-3 w-64 -translate-x-1/2 rounded-lg border border-light-border
              dark:border-dark-border bg-light-surface dark:bg-dark-surface p-3 text-sm z-50 shadow-lg
              text-light-text dark:text-dark-text before:content-[''] before:absolute before:-top-2 before:left-1/2
              before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-light-surface
              dark:before:border-b-dark-surface"
            role="tooltip"
          >
            {tooltipText}
          </div>
        )}
      </div>
    </AppHeader>
  );
};

export default StorageHeader;
