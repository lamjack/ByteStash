import React from "react";
import { useTranslation } from "react-i18next";
import CategoryTag, { type CategoryTagVariant } from "./CategoryTag";

interface CategoryListProps {
  categories: string[];
  onCategoryClick: (e: React.MouseEvent, category: string) => void;
  className?: string;
  variant: CategoryTagVariant;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onCategoryClick,
  className = "",
  variant,
}) => {
  const { t: translate } = useTranslation("components/categories");

  if (categories.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-light-hover/50 px-2 py-0.5 text-xs font-medium text-light-text-secondary dark:bg-dark-hover/50 dark:text-dark-text-secondary">
            {translate("categoryList.noData")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1.5">
        {categories.map((category) => (
          <CategoryTag
            key={category}
            category={category}
            onClick={onCategoryClick}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryList;
