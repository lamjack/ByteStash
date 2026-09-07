import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, FolderTree, Search, Tag, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SnippetMetadata } from "../../types/metadata";
import {
  partitionSnippetFacets,
  type TaxonomyFacet,
} from "../../utils/categories/categoryUtils";

interface CategoryDrawerProps {
  isOpen: boolean;
  metadata: SnippetMetadata;
  selectedValues: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}

interface FacetSectionProps {
  title: string;
  emptyLabel: string;
  facets: TaxonomyFacet[];
  selectedValues: string[];
  icon: React.ReactNode;
  onToggle: (value: string) => void;
}

const FacetSection: React.FC<FacetSectionProps> = ({
  title,
  emptyLabel,
  facets,
  selectedValues,
  icon,
  onToggle,
}) => (
  <section aria-labelledby={`facet-${title}`}>
    <div className="mb-2 flex items-center justify-between border-b border-light-border pb-2 dark:border-dark-border">
      <h3
        id={`facet-${title}`}
        className="flex items-center gap-2 text-sm font-semibold text-light-text dark:text-dark-text"
      >
        {icon}
        {title}
      </h3>
      <span className="text-xs tabular-nums text-light-text-secondary dark:text-dark-text-secondary">
        {facets.length}
      </span>
    </div>
    {facets.length === 0 ? (
      <p className="py-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
        {emptyLabel}
      </p>
    ) : (
      <div className="space-y-1">
        {facets.map((facet) => {
          const isSelected = selectedValues.includes(facet.value);
          return (
            <button
              key={facet.value}
              type="button"
              onClick={() => onToggle(facet.value)}
              className={`flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:focus-visible:ring-dark-primary ${
                isSelected
                  ? "bg-light-primary/15 text-light-primary dark:bg-dark-primary/20 dark:text-dark-text"
                  : "text-light-text hover:bg-light-hover dark:text-dark-text dark:hover:bg-dark-hover"
              }`}
              aria-pressed={isSelected}
            >
              <span className="min-w-0 flex-1 truncate">{facet.label}</span>
              <span className="tabular-nums text-light-text-secondary dark:text-dark-text-secondary">
                {facet.count}
              </span>
              <span className="flex h-4 w-4 items-center justify-center">
                {isSelected && <Check size={14} aria-hidden="true" />}
              </span>
            </button>
          );
        })}
      </div>
    )}
  </section>
);

const CategoryDrawer: React.FC<CategoryDrawerProps> = ({
  isOpen,
  metadata,
  selectedValues,
  onToggle,
  onClear,
  onClose,
}) => {
  const { t: translate } = useTranslation("components/search");
  const [query, setQuery] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const taxonomy = useMemo(
    () => partitionSnippetFacets(metadata.facets),
    [metadata.facets]
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filterFacets = (facets: TaxonomyFacet[]) =>
    normalizedQuery
      ? facets.filter((facet) =>
          facet.label.toLocaleLowerCase().includes(normalizedQuery)
        )
      : facets;

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = filterFacets(taxonomy.categories);
  const tags = filterFacets(taxonomy.tags);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55"
        onClick={onClose}
        aria-label={translate("drawer.close")}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="taxonomy-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-light-border bg-light-bg shadow-2xl shadow-slate-950/20 dark:border-dark-border dark:bg-dark-bg dark:shadow-black/40"
      >
        <header className="flex items-start justify-between gap-4 border-b border-light-border px-5 py-4 dark:border-dark-border">
          <div>
            <h2
              id="taxonomy-drawer-title"
              className="text-lg font-semibold text-light-text dark:text-dark-text"
            >
              {translate("drawer.title")}
            </h2>
            <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {translate("drawer.description", { total: metadata.counts.total })}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-light-text-secondary transition-colors hover:bg-light-hover hover:text-light-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:text-dark-text-secondary dark:hover:bg-dark-hover dark:hover:text-dark-text dark:focus-visible:ring-dark-primary"
            aria-label={translate("drawer.close")}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="border-b border-light-border px-5 py-4 dark:border-dark-border">
          <label className="relative block">
            <span className="sr-only">{translate("drawer.search")}</span>
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={translate("drawer.search")}
              className="h-11 w-full rounded-lg border border-light-border bg-light-surface pl-10 pr-3 text-sm text-light-text outline-none transition-colors placeholder:text-light-text-secondary focus:border-light-primary focus:ring-2 focus:ring-light-primary/20 dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:placeholder:text-dark-text-secondary dark:focus:border-dark-primary"
            />
          </label>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <FacetSection
            title={translate("drawer.categories")}
            emptyLabel={translate("drawer.noCategories")}
            facets={categories}
            selectedValues={selectedValues}
            icon={<FolderTree size={17} aria-hidden="true" />}
            onToggle={onToggle}
          />
          <FacetSection
            title={translate("drawer.tags")}
            emptyLabel={translate("drawer.noTags")}
            facets={tags}
            selectedValues={selectedValues}
            icon={<Tag size={17} aria-hidden="true" />}
            onToggle={onToggle}
          />
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-light-border px-5 py-4 dark:border-dark-border">
          <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {translate("drawer.selected", { count: selectedValues.length })}
          </span>
          <button
            type="button"
            onClick={onClear}
            disabled={selectedValues.length === 0}
            className="min-h-10 rounded-lg px-3 text-sm font-medium text-light-primary transition-colors hover:bg-light-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary disabled:cursor-not-allowed disabled:opacity-40 dark:text-dark-text dark:hover:bg-dark-primary/20 dark:focus-visible:ring-dark-primary"
          >
            {translate("drawer.clear")}
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default CategoryDrawer;
