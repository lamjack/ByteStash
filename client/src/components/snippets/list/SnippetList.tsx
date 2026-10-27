import React from "react";
import { useTranslation } from "react-i18next";
import { Snippet } from "../../../types/snippets";
import { SnippetCard } from "./SnippetCard";

export interface SnippetListProps {
  snippets: Snippet[];
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onEdit: (snippet: Snippet) => void;
  onShare: (snippet: Snippet) => void;
  onDuplicate: (snippet: Snippet) => void;
  onCategoryClick: (category: string) => void;
  compactView: boolean;
  showCodePreview: boolean;
  previewLines: number;
  showCategories: boolean;
  showLineNumbers: boolean;
  isPublicView: boolean;
  isRecycleView: boolean;
  isAuthenticated: boolean;
  pinSnippet?: (id: string, isPinned: boolean) => Promise<Snippet | undefined>;
  favoriteSnippet?: (
    id: string,
    isFavorite: boolean
  ) => Promise<Snippet | undefined>;
  emptyState?: React.ReactNode;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  viewMode,
  onDelete,
  onRestore,
  onEdit,
  onShare,
  onDuplicate,
  onCategoryClick,
  compactView,
  showCodePreview,
  previewLines,
  showCategories,
  showLineNumbers,
  isPublicView,
  isRecycleView,
  isAuthenticated,
  pinSnippet,
  favoriteSnippet,
  emptyState,
}) => {
  const { t: translate } = useTranslation('components/snippets/list/snippetList');

  if (snippets.length === 0) {
    if (emptyState !== undefined) {
      return <>{emptyState}</>;
    }

    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-xl text-light-text-secondary dark:text-dark-text-secondary">
          {translate('noSnippetsMatch')}
        </p>
      </div>
    );
  }
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          : "divide-y divide-light-border/70 overflow-hidden rounded-xl bg-light-surface/60 dark:divide-dark-border/70 dark:bg-dark-surface/60"
      }
    >
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          viewMode={viewMode}
          onDelete={onDelete}
          onRestore={onRestore}
          onEdit={onEdit}
          onShare={onShare}
          onDuplicate={onDuplicate}
          onCategoryClick={onCategoryClick}
          compactView={compactView}
          showCodePreview={showCodePreview}
          previewLines={previewLines}
          showCategories={showCategories}
          showLineNumbers={showLineNumbers}
          isPublicView={isPublicView}
          isRecycleView={isRecycleView}
          isAuthenticated={isAuthenticated}
          pinSnippet={pinSnippet}
          favoriteSnippet={favoriteSnippet}
        />
      ))}
    </div>
  );
};

export default SnippetList;
