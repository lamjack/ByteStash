import React, { useState } from "react";
import {
  UsersRound,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Globe,
  Pin,
  Star,
  FolderTree,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import SnippetCardMenu from "./SnippetCardMenu";
import SnippetRecycleCardMenu from "./SnippetRecycleCardMenu";
import { ConfirmationModal } from "../../common/modals/ConfirmationModal";
import { Snippet } from "../../../types/snippets";
import CategoryList from "../../categories/CategoryList";
import { PreviewCodeBlock } from "../../editor/PreviewCodeBlock";
import {
  getUniqueLanguages,
  getFullFileName,
  getFileIcon,
} from "../../../utils/language/languageUtils";
import { basePath } from "../../../utils/api/basePath";
import { partitionSnippetCategories } from "../../../utils/categories/categoryUtils";
import SnippetCardLink from "./SnippetCardLink";

interface SnippetCardProps {
  snippet: Snippet;
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
  isPublicView?: boolean;
  isRecycleView?: boolean;
  isAuthenticated: boolean;
  pinSnippet?: (id: string, isPinned: boolean) => Promise<Snippet | undefined>;
  favoriteSnippet?: (
    id: string,
    isFavorite: boolean
  ) => Promise<Snippet | undefined>;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  onDelete,
  onRestore,
  onEdit,
  onShare,
  onDuplicate,
  onCategoryClick,
  viewMode,
  compactView,
  showCodePreview,
  previewLines,
  showCategories,
  showLineNumbers,
  isPublicView = false,
  isRecycleView = false,
  isAuthenticated,
  pinSnippet,
  favoriteSnippet,
}) => {
  const { t } = useTranslation();
  const { t: translate } = useTranslation('components/snippets/list/snippetCard');
  const [currentSnippet, setCurrentSnippet] = useState<Snippet>(snippet);
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(snippet.is_pinned);
  const [isFavorite, setIsFavorite] = useState(snippet.is_favorite);

  const getRelativeUpdateTime = (updatedAt: string): string => {
    const defaultUpdateTime = translate('defaultUpdateTime');

    try {
      if (!updatedAt) {
        return defaultUpdateTime;
      }
      const updateDate = new Date(updatedAt);
      if (isNaN(updateDate.getTime())) {
        return defaultUpdateTime;
      }
      return formatDistanceToNow(updateDate);
    } catch (error) {
      console.error("Error formatting update date:", error);
      return defaultUpdateTime;
    }
  };

  const handleDeleteConfirm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onDelete(snippet.id);
    setIsDeleteModalOpen(false);
  };

  const handleRestoreConfirm = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onRestore(snippet.id);
    setIsRestoreModalOpen(false);
  };

  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.preventDefault();
    e.stopPropagation();
    onCategoryClick(category);
  };

  const handlePrevFragment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFragmentIndex((prev) =>
      prev > 0 ? prev - 1 : snippet.fragments.length - 1
    );
  };

  const handleNextFragment = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentFragmentIndex((prev) =>
      prev < snippet.fragments.length - 1 ? prev + 1 : 0
    );
  };

  const handleOpenInNewTab = () => {
    window.open(`${basePath}/snippets/${snippet.id}`, "_blank");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRestoreModalOpen(true);
  };

  const handleDeleteModalClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsDeleteModalOpen(false);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate(snippet);
  };

  const handlePin = async () => {
    if (!pinSnippet) return;
    try {
      const updatedSnippet = await pinSnippet(
        currentSnippet.id,
        currentSnippet.is_pinned === 1
      );
      if (updatedSnippet) {
        setCurrentSnippet(updatedSnippet);
        setIsPinned(updatedSnippet.is_pinned);
      }
    } catch (error) {
      console.error("Error pinning snippet:", error);
    }
  };

  const handleFavorite = async () => {
    if (!favoriteSnippet) return;
    try {
      const updatedSnippet = await favoriteSnippet(
        currentSnippet.id,
        currentSnippet.is_favorite === 1
      );
      if (updatedSnippet) {
        setCurrentSnippet(updatedSnippet);
        setIsFavorite(updatedSnippet.is_favorite);
      }
    } catch (error) {
      console.error("Error favoriting snippet:", error);
    }
  };

  const currentFragment = snippet.fragments[currentFragmentIndex];
  const taxonomy = partitionSnippetCategories(snippet.categories);
  const languageLabel = getUniqueLanguages(snippet.fragments);
  const hasStatusMeta =
    snippet.is_public === 1 ||
    Boolean(snippet.group_id) ||
    (isPublicView && (snippet.share_count || 0) > 0) ||
    isPinned === 1 ||
    isFavorite === 1 ||
    Boolean(snippet.updated_at) ||
    Boolean(snippet.expiry_date);

  const renderLanguageMeta = () => (
    <>
      {languageLabel && (
        <div className="flex items-center gap-1 text-light-text-secondary dark:text-dark-text-secondary">
          <div className="shrink-0 w-3.5 h-3.5 flex items-center justify-center">
            {getFileIcon(snippet.fragments[0]?.file_name || "", snippet.fragments[0]?.language, "w-full h-full text-light-text-secondary dark:text-dark-text-secondary")}
          </div>
          <span className="whitespace-nowrap">{languageLabel}</span>
        </div>
      )}
      {snippet.fragments.length > 1 && (
        <span className="whitespace-nowrap">
          {languageLabel ? '· ' : ''}{translate('fileCount', { count: snippet.fragments.length })}
        </span>
      )}
      {snippet.username && isPublicView && (
        <div className="flex items-center gap-1 text-light-text-secondary dark:text-dark-text-secondary">
          <Users size={14} />
          <span>{snippet.username}</span>
        </div>
      )}
    </>
  );

  const renderStatusMeta = (
    className = "flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-light-text-secondary dark:text-dark-text-secondary"
  ) => (
    <div className={className}>
      {hasStatusMeta && (
        <>
          {snippet.is_public === 1 && (
            <Globe size={14} aria-label={translate('public')} role="img" />
          )}
          {snippet.is_public !== 1 && snippet.group_id && (
            <span
              className="flex items-center gap-1"
              title={translate('groupOnly', { group: snippet.group_name || '' })}
            >
              <UsersRound size={14} aria-hidden="true" />
              <span className="max-w-[8rem] truncate">{snippet.group_name}</span>
            </span>
          )}
          {isPublicView && (snippet.share_count || 0) > 0 && (
            <Users size={14} aria-label={translate('shared')} role="img" />
          )}
          {isPinned === 1 && (
            <Pin size={14} aria-label={translate('pinned')} role="img" />
          )}
          {isFavorite === 1 && (
            <Star
              size={14}
              aria-label={translate('favorite')}
              role="img"
              className="text-yellow-500"
              fill="currentColor"
            />
          )}
          <div className="flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {!isRecycleView ? (
              <span>{translate('date.ago', { date: getRelativeUpdateTime(snippet.updated_at) })}</span>
            ) : snippet.expiry_date ? (
              <span>{translate('date.left', { date: getRelativeUpdateTime(snippet.expiry_date) })}</span>
            ) : (
              <span>{translate('date.expiringSoon')}</span>
            )}
          </div>
        </>
      )}
    </div>
  );

  const renderCategoryLabels = (className: string) =>
    showCategories && taxonomy.categories.length > 0 ? (
      <div className={className}>
        <FolderTree size={14} aria-hidden="true" />
        {taxonomy.categories.map((category) => (
          <span key={category.value} className="truncate">
            {category.label}
          </span>
        ))}
      </div>
    ) : null;

  const renderActions = (className = "") => (
    <div className={`pointer-events-auto relative z-20 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 ${className}`}>
      {!isRecycleView ? (
        <SnippetCardMenu
          onEdit={(e: React.MouseEvent) => {
            e.stopPropagation();
            onEdit(snippet);
          }}
          onDelete={handleDelete}
          onShare={(e: React.MouseEvent) => {
            e.stopPropagation();
            onShare(snippet);
          }}
          onOpenInNewTab={handleOpenInNewTab}
          onDuplicate={handleDuplicate}
          isPublicView={isPublicView}
          isAuthenticated={isAuthenticated}
          isPinned={isPinned === 1}
          isFavorite={isFavorite === 1}
          handlePin={handlePin}
          handleFavorite={handleFavorite}
        />
      ) : (
        <SnippetRecycleCardMenu
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      )}
    </div>
  );

  return (
    <>
      {viewMode === "list" ? (
        <article className="group relative flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 transition-colors hover:bg-light-surface focus-within:bg-light-surface dark:hover:bg-dark-surface dark:focus-within:bg-dark-surface md:flex-nowrap">
          {!isRecycleView && (
            <SnippetCardLink snippetId={snippet.id} title={snippet.title} />
          )}
          <div className="min-w-0 basis-full pointer-events-none relative z-10 md:basis-0 md:flex-1">
            {renderCategoryLabels("mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-light-text-secondary dark:text-dark-text-secondary")}
            <h3 className="text-base font-semibold leading-snug break-words text-light-text dark:text-dark-text">
              {snippet.title}
            </h3>
          </div>
          <div className="hidden md:flex w-52 shrink-0 items-center gap-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {renderLanguageMeta()}
            </div>
          </div>
          <div className="hidden lg:flex w-80 shrink-0 flex-wrap gap-1.5 pointer-events-auto relative z-20">
            {showCategories && taxonomy.tags.length > 0 && (
              <CategoryList
                categories={taxonomy.tags.map((tag) => tag.value)}
                onCategoryClick={handleCategoryClick}
                variant="clickable"
              />
            )}
          </div>
          {renderStatusMeta("w-auto md:w-32 ml-0 md:ml-0 shrink-0 flex items-center justify-end gap-2 text-xs tabular-nums text-light-text-secondary dark:text-dark-text-secondary")}
          {renderActions("ml-auto md:ml-0")}
        </article>
      ) : (
        <article className="group relative overflow-hidden rounded-xl bg-light-surface/80 transition duration-200 hover:-translate-y-0.5 hover:bg-light-surface focus-within:bg-light-surface dark:bg-dark-surface/80 dark:hover:bg-dark-surface dark:focus-within:bg-dark-surface">
          {!isRecycleView && (
            <SnippetCardLink snippetId={snippet.id} title={snippet.title} />
          )}
          <div className="pointer-events-none relative z-10 p-4">
            {renderCategoryLabels("mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary")}
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  className={`${
                    compactView ? "text-lg" : "text-xl"
                  } break-words font-semibold leading-snug tracking-tight text-light-text dark:text-dark-text`}
                >
                  {snippet.title}
                </h3>
              </div>
              {renderActions("sm:absolute sm:right-3 sm:top-3")}
            </div>
            <div className="mt-1 mb-3 flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                {renderLanguageMeta()}
              </div>
              {renderStatusMeta()}
            </div>

            {!compactView && snippet.description && (
              <div className="mb-3 text-sm text-light-text dark:text-dark-text line-clamp-2 overflow-hidden">
                <ReactMarkdown className="markdown prose dark:prose-invert max-w-none">
                  {snippet.description}
                </ReactMarkdown>
              </div>
            )}

            {showCodePreview && currentFragment && (
              <div className="pointer-events-auto relative z-20">
                <div className="flex items-center justify-between px-2 mb-1 text-xs rounded text-light-text-secondary dark:text-dark-text-secondary bg-light-hover/50 dark:bg-dark-hover/50 h-7">
                  <div className="flex items-center flex-1 min-w-0 gap-1">
                    <div className="shrink-0 w-3 h-3 flex items-center justify-center">
                      {getFileIcon(currentFragment.file_name, currentFragment.language, "w-full h-full text-light-text-secondary dark:text-dark-text-secondary")}
                    </div>
                    <span className="truncate">{getFullFileName(currentFragment.file_name, currentFragment.language)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 ml-2">
                    {snippet.fragments.length > 1 ? (
                      <>
                        <button
                          onClick={handlePrevFragment}
                          className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-light-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:hover:bg-dark-hover dark:focus-visible:ring-dark-primary"
                          aria-label={t("pagination.previous")}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="mx-1 text-light-text-secondary dark:text-dark-text-secondary">
                          {currentFragmentIndex + 1}/{snippet.fragments.length}
                        </span>
                        <button
                          onClick={handleNextFragment}
                          className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-light-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:hover:bg-dark-hover dark:focus-visible:ring-dark-primary"
                          aria-label={t("pagination.next")}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="w-[14px]" />
                    )}
                  </div>
                </div>

                <PreviewCodeBlock
                  code={currentFragment.code}
                  language={currentFragment.language}
                  previewLines={previewLines}
                  showLineNumbers={showLineNumbers}
                  isPublicView={isPublicView}
                  isRecycleView={isRecycleView}
                  snippetId={snippet.id}
                  fragmentId={currentFragment.id}
                />
              </div>
            )}

            {showCategories && taxonomy.tags.length > 0 && (
              <div className="pointer-events-auto relative z-20 mt-3 border-t border-light-border/70 pt-3 dark:border-dark-border/70">
                <CategoryList
                  categories={taxonomy.tags.map((tag) => tag.value)}
                  onCategoryClick={handleCategoryClick}
                  variant="clickable"
                />
              </div>
            )}
          </div>
        </article>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title={
          isRecycleView
            ? translate('confirmationModalDelete.title.isRecycleView.true')
            : translate('confirmationModalDelete.title.isRecycleView.false')
        }
        message={
          isRecycleView
            ? translate('confirmationModalDelete.message.isRecycleView.true', { title: snippet.title })
            : translate('confirmationModalDelete.message.isRecycleView.false', { title: snippet.title })
        }
        confirmLabel={
          isRecycleView
            ? translate('confirmationModalDelete.confirmLabel.isRecycleView.true')
            : translate('confirmationModalDelete.confirmLabel.isRecycleView.false')
        }
        cancelLabel={t('action.cancel')}
        variant="danger"
      />

      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={handleRestoreConfirm}
        title={translate('confirmationModalRestore.title')}
        message={translate('confirmationModalRestore.message', { title: snippet.title })}
        confirmLabel={t('action.restore')}
        cancelLabel={t('action.cancel')}
        variant="info"
      />
    </>
  );
};
