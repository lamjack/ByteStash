import React, { memo, useMemo } from "react";
import {
  ChevronDown,
  Grid,
  List,
  Settings,
  Plus,
  Trash,
  Star,
  Tags,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { SearchBar } from "./SearchBar";
import { IconButton } from "../common/buttons/IconButton";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { SnippetMetadata } from "../../types/metadata";

export interface SearchAndFilterProps {
  metadata: SnippetMetadata;
  onSearchChange: (search: string) => void;
  onLanguageChange: (language: string) => void;
  onCategoryToggle: (category: string) => void;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  openSettingsModal: () => void;
  openNewSnippetModal: () => void;
  openCategoryDrawer?: () => void;
  hideCategoryDrawer?: boolean;
  hideNewSnippet?: boolean;
  hideRecycleBin?: boolean;
  showFavorites?: boolean;
  handleShowFavorites?: () => void;
  isPublicView?: boolean;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = memo(({
  metadata,
  onSearchChange,
  onLanguageChange,
  onCategoryToggle,
  onSortChange,
  viewMode,
  setViewMode,
  openSettingsModal,
  openNewSnippetModal,
  openCategoryDrawer,
  hideCategoryDrawer = false,
  hideNewSnippet = false,
  hideRecycleBin = false,
  showFavorites,
  handleShowFavorites,
}) => {
  const { t: translate } = useTranslation('components/search');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const selectedCategories = useMemo(() =>
    searchParams.get("categories")?.split(",").filter(Boolean) || [],
    [searchParams]
  );

  const currentLanguage = useMemo(() =>
    searchParams.get("language") || "",
    [searchParams]
  );

  const currentSort = useMemo(() =>
    searchParams.get("sort") || "newest",
    [searchParams]
  );

  const currentSearch = useMemo(() =>
    searchParams.get("search") || "",
    [searchParams]
  );

  const sortOptions = [
    { value: "newest" as const, label: translate('sort.newestFirst') },
    { value: "oldest" as const, label: translate('sort.oldestFirst') },
    { value: "alpha-asc" as const, label: translate('sort.alphaAsc') },
    { value: "alpha-desc" as const, label: translate('sort.alphaDesc') },
  ];

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-light-surface/45 p-2 dark:bg-dark-surface/45">
      <SearchBar
        value={currentSearch}
        onChange={onSearchChange}
        onCategorySelect={onCategoryToggle}
        existingCategories={metadata.categories}
        selectedCategories={selectedCategories}
      />

      {!hideCategoryDrawer && (
        <button
          type="button"
          onClick={openCategoryDrawer}
          className="flex h-10 items-center gap-2 rounded-lg border border-light-border bg-light-surface px-3 text-sm font-medium text-light-text transition-colors hover:border-light-primary/50 hover:bg-light-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:border-dark-primary/60 dark:hover:bg-dark-hover dark:focus-visible:ring-dark-primary"
        >
          <Tags size={18} aria-hidden="true" />
          <span>{translate("action.browseCategories")}</span>
          <span className="rounded bg-light-bg px-1.5 py-0.5 text-xs tabular-nums text-light-text-secondary dark:bg-dark-bg dark:text-dark-text-secondary">
            {selectedCategories.length > 0
              ? `${selectedCategories.length}/${metadata.facets.length}`
              : metadata.facets.length}
          </span>
        </button>
      )}

      <div className="relative">
        <select
          className="h-10 appearance-none rounded-lg bg-light-surface px-3 pr-9 text-sm text-light-text focus:outline-none focus:ring-2 focus:ring-light-primary dark:bg-dark-surface dark:text-dark-text dark:focus:ring-dark-primary"
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label={translate("filter.language.label")}
        >
          <option value="">{translate('filter.language.all')}</option>
          {metadata.languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute -translate-y-1/2 pointer-events-none right-2 top-1/2 text-light-text-secondary dark:text-dark-text-secondary"
          size={20}
        />
      </div>

      <div className="relative">
        <select
          className="h-10 appearance-none rounded-lg bg-light-surface px-3 pr-9 text-sm text-light-text focus:outline-none focus:ring-2 focus:ring-light-primary dark:bg-dark-surface dark:text-dark-text dark:focus:ring-dark-primary"
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label={translate("sort.label")}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute -translate-y-1/2 pointer-events-none right-2 top-1/2 text-light-text-secondary dark:text-dark-text-secondary"
          size={20}
        />
      </div>

      <div className="flex items-center gap-2">
        <IconButton
          icon={<Grid size={20} />}
          onClick={() => setViewMode("grid")}
          variant={viewMode === "grid" ? "primary" : "secondary"}
          className="h-10 px-4"
          label={translate('view.grid')}
        />
        <IconButton
          icon={<List size={20} />}
          onClick={() => setViewMode("list")}
          variant={viewMode === "list" ? "primary" : "secondary"}
          className="h-10 px-4"
          label={translate('view.list')}
        />
        <IconButton
          icon={<Settings size={20} />}
          onClick={openSettingsModal}
          variant="secondary"
          className="h-10 px-4"
          label={translate('action.openSettings')}
        />
        {!hideNewSnippet && (
          <div className="flex gap-2">
            {!hideRecycleBin && (
              <IconButton
                icon={<Plus size={20} />}
                label={translate('action.newSnippet')}
                onClick={openNewSnippetModal}
                variant="action"
                className="h-10 pl-2 pr-4"
                showLabel
              />
            )}
            <IconButton
              icon={<Star size={20} />}
              onClick={handleShowFavorites || (() => {})}
              variant={showFavorites ? "primary" : "secondary"}
              className="h-10 px-4"
              label={showFavorites ? translate('action.showAll') : translate('action.showFavorites')}
            />
            <IconButton
              icon={<Trash size={20} />}
              onClick={() => navigate("/recycle/snippets")}
              variant={
                location.pathname === "/recycle/snippets"
                  ? "primary"
                  : "secondary"
              }
              className="h-10 px-4"
              label={translate('action.recycleBin')}
            />
          </div>
        )}
      </div>
    </div>
  );
});

SearchAndFilter.displayName = 'SearchAndFilter';
