import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useSettings } from "../../../../hooks/useSettings";
import { useAuth } from "../../../../hooks/useAuth";
import { initializeMonaco } from "../../../../utils/language/languageUtils";
import { snippetService } from "../../../../service/snippetService";
import SettingsModal from "../../../settings/SettingsModal";
import { SearchAndFilter } from "../../../search/SearchAndFilter";
import { UserDropdown } from "../../../auth/UserDropdown";
import StorageHeader from "../common/StorageHeader";
import PublicSnippetContentArea from "./PublicSnippetContentArea";
import CategoryDrawer from "../../../categories/CategoryDrawer";
import {
  EMPTY_SNIPPET_METADATA,
  type SnippetMetadata,
} from "../../../../types/metadata";

const PublicSnippetStorage: React.FC = () => {
  // URL-based filter state
  const [searchParams, setSearchParams] = useSearchParams();

  // Settings
  const {
    viewMode,
    setViewMode,
    compactView,
    showCodePreview,
    previewLines,
    includeCodeInSearch,
    updateSettings,
    showCategories,
    expandCategories,
    showLineNumbers,
    theme,
    locale,
  } = useSettings();

  const { isAuthenticated } = useAuth();

  // Metadata - loaded once
  const [metadata, setMetadata] = useState<SnippetMetadata>(
    EMPTY_SNIPPET_METADATA
  );

  // UI state
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  useEffect(() => {
    initializeMonaco();
  }, []);

  // Load metadata once
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await snippetService.getPublicSnippetsMetadata();
        setMetadata(data);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };
    fetchMetadata();
  }, []);


  // URL update handlers - stable callbacks
  const handleSearchChange = useCallback((search: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const trimmedSearch = search.trim();
      if (trimmedSearch) {
        next.set("search", trimmedSearch);
      } else {
        next.delete("search");
      }
      return next;
    });
  }, [setSearchParams]);

  const handleLanguageChange = useCallback((language: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (language) {
        next.set("language", language);
      } else {
        next.delete("language");
      }
      return next;
    });
  }, [setSearchParams]);

  const handleCategoryToggle = useCallback((category: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const current = next.get("categories")?.split(",").filter(Boolean) || [];
      const updated = current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category];

      if (updated.length > 0) {
        next.set("categories", updated.join(","));
      } else {
        next.delete("categories");
      }
      return next;
    });
  }, [setSearchParams]);

  const handleClearCategories = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("categories");
      return next;
    });
  }, [setSearchParams]);

  const handleSortChange = useCallback((sort: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("sort", sort);
      return next;
    });
  }, [setSearchParams]);

  // Handlers
  const handleSettingsOpen = useCallback(() => setIsSettingsModalOpen(true), []);
  const handleNewSnippet = useCallback(() => null, []);

  return (
    <>
      <div className="min-h-screen bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text">
        <main id="main-content" className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <StorageHeader isPublicView={true} />
          <UserDropdown />
        </div>

        <SearchAndFilter
          metadata={metadata}
          onSearchChange={handleSearchChange}
          onLanguageChange={handleLanguageChange}
          onCategoryToggle={handleCategoryToggle}
          onSortChange={handleSortChange}
          viewMode={viewMode}
          setViewMode={setViewMode}
          openSettingsModal={handleSettingsOpen}
          openNewSnippetModal={handleNewSnippet}
          openCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
          hideNewSnippet={true}
          hideRecycleBin={false}
        />

        <PublicSnippetContentArea
          includeCodeInSearch={includeCodeInSearch}
          viewMode={viewMode}
          compactView={compactView}
          showCodePreview={showCodePreview}
          previewLines={previewLines}
          showCategories={showCategories}
          showLineNumbers={showLineNumbers}
          isAuthenticated={isAuthenticated}
          onCategoryClick={handleCategoryToggle}
        />
        </main>
      </div>

      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        metadata={metadata}
        selectedValues={searchParams.get("categories")?.split(",").filter(Boolean) || []}
        onToggle={handleCategoryToggle}
        onClear={handleClearCategories}
        onClose={() => setIsCategoryDrawerOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={{
          compactView,
          showCodePreview,
          previewLines,
          includeCodeInSearch,
          showCategories,
          expandCategories,
          showLineNumbers,
          theme,
          locale,
        }}
        onSettingsChange={updateSettings}
        isPublicView={true}
      />
    </>
  );
};

export default PublicSnippetStorage;
