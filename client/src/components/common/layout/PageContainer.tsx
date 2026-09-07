import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  title,
  actions
}) => {
  return (
    <div className="min-h-[100dvh] bg-light-bg px-4 py-5 text-light-text dark:bg-dark-bg dark:text-dark-text sm:px-6 lg:px-8">
      <div className={`max-w-7xl mx-auto ${className}`}>
        {(title || actions) && (
          <div className="flex justify-between items-center mb-6">
            {title && <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">{title}</h1>}
            {actions && <div className="flex items-center gap-4">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
