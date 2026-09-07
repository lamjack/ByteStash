import React from 'react';

export type CategoryTagVariant = 'removable' | 'clickable';

interface CategoryTagProps {
  category: string;
  onClick: (e: React.MouseEvent, category: string) => void;
  variant: CategoryTagVariant;
  className?: string;
}

const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  onClick,
  variant,
  className = ""
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(e, category);
  };

  if (variant === 'removable') {
    return (
      <button
        onClick={handleClick}
        className={`group flex items-center gap-1 rounded-md bg-light-hover/50 px-2 py-1 text-sm transition-colors hover:bg-light-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:bg-dark-hover/50 dark:hover:bg-dark-hover dark:focus-visible:ring-dark-primary ${className}`}
        type="button"
      >
        <span className='text-light-text dark:text-dark-text'>{category}</span>
        <span className="text-light-text-secondary dark:text-dark-text-secondary group-hover:text-light-text dark:group-hover:text-dark-text">×</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`rounded-md border border-light-border bg-light-bg px-2 py-0.5 text-xs font-medium text-light-text-secondary transition-colors duration-200 hover:border-light-primary/50 hover:bg-light-primary/10 hover:text-light-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:border-dark-border dark:bg-dark-bg dark:text-dark-text-secondary dark:hover:border-dark-primary/60 dark:hover:bg-dark-primary/15 dark:hover:text-dark-text dark:focus-visible:ring-dark-primary ${className}`}
      type="button"
    >
      {category}
    </button>
  );
};

export default CategoryTag;
