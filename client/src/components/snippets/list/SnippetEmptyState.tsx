import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SnippetEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreate: () => void;
}

const SnippetEmptyState: React.FC<SnippetEmptyStateProps> = ({
  hasActiveFilters,
  onClearFilters,
  onCreate,
}) => {
  const { t: translate } = useTranslation("components/snippets/list/snippetList");

  return (
    <div className="py-12 text-center">
      {hasActiveFilters ? (
        <>
          <h2 className="mb-4 text-xl text-light-text-secondary dark:text-dark-text-secondary">
            {translate("empty.filtered.title")}
          </h2>
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-light-border px-4 py-2 text-sm font-medium text-light-text transition-colors hover:bg-light-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-hover dark:focus-visible:ring-dark-primary"
          >
            {translate("empty.filtered.action")}
          </button>
        </>
      ) : (
        <>
          <h2 className="mb-2 text-xl text-light-text-secondary dark:text-dark-text-secondary">
            {translate("empty.library.title")}
          </h2>
          <p className="mb-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {translate("empty.library.body")}
          </p>
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-light-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:bg-dark-primary dark:focus-visible:ring-dark-primary"
          >
            <Plus size={16} aria-hidden="true" />
            {translate("empty.library.action")}
          </button>
        </>
      )}
    </div>
  );
};

export default SnippetEmptyState;
