import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CodeFragment, EditPermission, Group, Snippet, SnippetVisibility } from "../../../types/snippets";
import { fetchPublishableGroups } from "../../../utils/api/groups";
import {
  detectLanguageFromFileName,
  getLanguageDropdownSections,
} from "../../../utils/language/languageUtils";
import CategoryList from "../../categories/CategoryList";
import CategorySuggestions from "../../categories/CategorySuggestions";
import FileUploadButton from "../../common/buttons/FileUploadButton";
import Modal from "../../common/modals/Modal";
import { FragmentEditor } from "./FragmentEditor";

const getSnippetVisibility = (snippet: Snippet | null): SnippetVisibility => {
  if (!snippet) return "private";
  if (snippet.visibility) return snippet.visibility;
  if (snippet.is_public) return "public";
  return snippet.group_id ? "protected" : "private";
};

const getMostUsedLanguage = (): string => {
  const sections = getLanguageDropdownSections();
  return sections.used[0] || "";
};

export interface EditSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (snippetData: Omit<Snippet, "id" | "updated_at">) => void;
  snippetToEdit: Snippet | null;
  showLineNumbers: boolean;
  allCategories: string[];
  // False when a group member edits someone else's snippet: sharing settings stay hidden
  isOwner?: boolean;
}

const EditSnippetModal: React.FC<EditSnippetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  snippetToEdit,
  showLineNumbers,
  allCategories,
  isOwner = true,
}) => {
  const { t } = useTranslation();
  const { t: translate } = useTranslation('components/snippets/edit');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fragments, setFragments] = useState<CodeFragment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibility, setVisibility] = useState<SnippetVisibility>(getSnippetVisibility(snippetToEdit));
  const [groupId, setGroupId] = useState<number | null>(snippetToEdit?.group_id ?? null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const [editPermission, setEditPermission] = useState<EditPermission>(snippetToEdit?.edit_permission ?? "owner");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleFileNameChange = (index: number, newName: string) => {
    setFragments((current) => {
      const newFragments = [...current];
      newFragments[index] = { ...newFragments[index], file_name: newName };

      const detectedLanguage = detectLanguageFromFileName(newName);
      if (detectedLanguage) {
        newFragments[index].language = detectedLanguage;
      }

      return newFragments;
    });
    setHasUnsavedChanges(true);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFragments([
      {
        file_name: "main",
        code: "",
        language: getMostUsedLanguage(),
        position: 0,
      },
    ]);
    setCategories([]);
    setVisibility("private");
    setGroupId(null);
    setEditPermission("owner");
    setIsSharingOpen(false);
    setError("");
    setCategoryInput("");
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (snippetToEdit) {
        setTitle(snippetToEdit.title?.slice(0, 255) || "");
        setDescription(snippetToEdit.description || "");
        setFragments(JSON.parse(JSON.stringify(snippetToEdit.fragments || [])));
        setCategories(snippetToEdit.categories || []);
        setVisibility(getSnippetVisibility(snippetToEdit));
        setGroupId(snippetToEdit.group_id ?? null);
        setEditPermission(snippetToEdit.edit_permission ?? "owner");
      } else {
        resetForm();
      }
    }
  }, [isOpen, snippetToEdit]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetchPublishableGroups()
      .then((result) => {
        if (!cancelled) setGroups(Array.isArray(result) ? result : []);
      })
      .catch(() => {
        if (!cancelled) setGroups([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const visibilityOptions: SnippetVisibility[] = ["private", "public", "protected"];

  const editPermissionOptions: EditPermission[] = ["owner", "group", "readonly"];
  // Group editing only makes sense for group-only snippets
  const effectiveEditPermission: EditPermission =
    editPermission === "group" && visibility !== "protected" ? "owner" : editPermission;
  const isLocked = isOwner && snippetToEdit?.edit_permission === "readonly" && effectiveEditPermission === "readonly";

  // Keep the snippet's current group selectable even if the user is no longer listed in it
  const groupOptions =
    groupId && snippetToEdit?.group_name && !groups.some((g) => g.id === groupId)
      ? [...groups, { id: groupId, name: snippetToEdit.group_name }]
      : groups;

  const handleCategorySelect = (category: string) => {
    const normalizedCategory = category.toLowerCase().trim();
    if (
      normalizedCategory &&
      categories.length < 20 &&
      !categories.includes(normalizedCategory)
    ) {
      setCategories((prev) => [...prev, normalizedCategory]);
      setHasUnsavedChanges(true);
    }
    setCategoryInput("");
  };

  const handleRemoveCategory = (e: React.MouseEvent, category: string) => {
    e.preventDefault();
    setCategories((cats) => cats.filter((c) => c !== category));
    setHasUnsavedChanges(true);
  };

  const handleAddFragment = () => {
    setFragments((current) => [
      ...current,
      {
        file_name: `file${current.length + 1}`,
        code: "",
        language: getMostUsedLanguage(),
        position: current.length,
      },
    ]);
    setHasUnsavedChanges(true);
  };

  const handleFileUpload = (fileData: {
    file_name: string;
    code: string;
    language: string;
    position: number;
  }) => {
    setFragments((current) => [
      ...current,
      {
        ...fileData,
        position: current.length,
      },
    ]);
    setHasUnsavedChanges(true);
  };

  const handleUploadError = (error: string) => {
    setError(error);
    // Clear error after 5 seconds
    setTimeout(() => {
      setError("");
    }, 5000);
  };

  const handleUpdateFragment = (
    index: number,
    updatedFragment: CodeFragment
  ) => {
    setFragments((current) => {
      const newFragments = [...current];
      newFragments[index] = updatedFragment;
      return newFragments;
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteFragment = (index: number) => {
    if (fragments.length <= 1) return;

    setFragments((current) =>
      current
        .filter((_, i) => i !== index)
        .map((fragment, i) => ({ ...fragment, position: i }))
    );
    setHasUnsavedChanges(true);
  };

  const moveFragment = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= fragments.length) return;

    setFragments((current) => {
      const newFragments = [...current];
      const [movedFragment] = newFragments.splice(fromIndex, 1);
      newFragments.splice(toIndex, 0, movedFragment);
      return newFragments.map((fragment, index) => ({
        ...fragment,
        position: index,
      }));
    });
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (fragments.length === 0) {
      setError(translate('editSnippetModal.fragmentRequired'));
      return;
    }

    if (fragments.some((f) => !f.file_name.trim())) {
      setError(translate('editSnippetModal.mustHaveFileNames'));
      return;
    }

    if (isLocked) {
      setIsSharingOpen(true);
      setError(translate('editSnippetModal.form.editPermission.locked'));
      return;
    }

    if (visibility === "protected" && !groupId) {
      setIsSharingOpen(true);
      setError(translate('editSnippetModal.form.visibility.groupRequired'));
      return;
    }

    setIsSubmitting(true);
    const snippetData = {
      title: title.slice(0, 255),
      description: description,
      fragments: fragments.map((f, idx) => ({ ...f, position: idx })),
      categories: categories,
      is_public: visibility === "public" ? 1 : 0,
      visibility,
      group_id: visibility === "protected" ? groupId : null,
      edit_permission: effectiveEditPermission,
      is_pinned: snippetToEdit?.is_pinned || 0,
      is_favorite: snippetToEdit?.is_favorite || 0,
    };

    try {
      await onSubmit(snippetData);
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      setError(translate('editSnippetModal.error.savingFailed'));
      console.error("Error saving snippet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        translate('editSnippetModal.unsavedChanges')
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      fullHeight
      expandable={true}
      title={
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
          {
            snippetToEdit
              ? translate('editSnippetModal.editSnippet')
              : translate('editSnippetModal.addSnippet')
          }
        </h2>
      }
    >
      <style>
        {`
          .modal-footer {
            position: sticky;
            background: var(--footer-bg);
            border-top: 1px solid var(--footer-border);
            margin-top: 1rem;
            z-index: 100;
          }

          .modal-footer::before {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            height: 20px;
            background: linear-gradient(to top, var(--footer-bg), transparent);
            pointer-events: none;
          }

          :root {
            --footer-bg: var(--light-surface);
            --footer-border: var(--light-border);
          }

          .dark {
            --footer-bg: var(--dark-surface);
            --footer-border: var(--dark-border);
          }
        `}
      </style>
      <div className="relative flex flex-col h-full max-h-full isolate">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-none">
            {error && (
              <p className="mb-4 text-red-500 dark:text-red-400">{error}</p>
            )}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="pr-2 space-y-4">
              {/* Title input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-light-text dark:text-dark-text"
                >
                  {translate('editSnippetModal.form.title.label')}
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value.slice(0, 100));
                    setHasUnsavedChanges(true);
                  }}
                  className="block w-full p-2 mt-1 text-sm border rounded-md bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-light-primary dark:focus:border-dark-primary"
                  required
                  placeholder={translate('editSnippetModal.form.title.placeholder', { max: 100 })}
                  maxLength={100}
                />
                {title.length >= 80 && (
                  <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {translate('editSnippetModal.form.title.counter', { characters: title.length, max: 100 })}
                  </p>
                )}
              </div>

              {/* Description input */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-light-text dark:text-dark-text"
                >
                  {translate('editSnippetModal.form.description.label')}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="block w-full p-2 mt-1 text-sm border rounded-md bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-light-primary dark:focus:border-dark-primary"
                  rows={3}
                  placeholder={translate('editSnippetModal.form.description.placeholder', { max: 20 })}
                />
              </div>

              {/* Categories section */}
              <div>
                <label
                  htmlFor="categories"
                  className="block text-sm font-medium text-light-text dark:text-dark-text"
                >
                  {translate('editSnippetModal.form.categories.label', { max: 20 })}
                </label>
                <CategorySuggestions
                  inputValue={categoryInput}
                  onInputChange={setCategoryInput}
                  onCategorySelect={handleCategorySelect}
                  existingCategories={allCategories}
                  selectedCategories={categories}
                  placeholder={translate('editSnippetModal.form.categories.placeholder')}
                  maxCategories={20}
                  showAddText={true}
                  handleHashtag={false}
                  className="block w-full p-2 mt-1 text-sm border rounded-md bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:border-light-primary dark:focus:border-dark-primary"
                />
                {categories.length >= 16 && (
                  <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {translate('editSnippetModal.form.categories.counter', { categories: categories.length, max: 20 })}
                  </p>
                )}
                <CategoryList
                  categories={categories}
                  onCategoryClick={handleRemoveCategory}
                  className="mt-2"
                  variant="removable"
                />
              </div>

              {/* Sharing settings: collapsed to a one-line summary so the code fragments stay near the top */}
              {isOwner && (
                <div className="space-y-2">
                  <button
                    type="button"
                    aria-expanded={isSharingOpen}
                    onClick={() => setIsSharingOpen((open) => !open)}
                    className="flex w-full items-center gap-2 text-left text-sm"
                  >
                    {isSharingOpen ? <ChevronDown size={16} aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
                    <span className="font-medium text-light-text dark:text-dark-text">
                      {translate('editSnippetModal.form.sharing.label')}
                    </span>
                    <span className="truncate text-light-text-secondary dark:text-dark-text-secondary">
                      {[
                        translate(`editSnippetModal.form.visibility.options.${visibility}.label`),
                        visibility === "protected" ? groupOptions.find((g) => g.id === groupId)?.name : null,
                        translate(`editSnippetModal.form.editPermission.options.${effectiveEditPermission}.label`),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </button>
                  {isSharingOpen && (
                  <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <label className="space-y-1">
                      <span className="block text-sm font-medium text-light-text dark:text-dark-text">
                        {translate('editSnippetModal.form.visibility.label')}
                      </span>
                      <select
                        value={visibility}
                        onChange={(e) => {
                          const value = e.target.value as SnippetVisibility;
                          setVisibility(value);
                          if (value === "protected" && !groupId && groupOptions.length > 0) {
                            setGroupId(groupOptions[0].id);
                          }
                          setHasUnsavedChanges(true);
                        }}
                        className="block w-full p-2 text-sm border rounded-md bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary disabled:opacity-60"
                      >
                        {visibilityOptions.map((value) => (
                          <option
                            key={value}
                            value={value}
                            disabled={value === "protected" && groupOptions.length === 0}
                          >
                            {translate(`editSnippetModal.form.visibility.options.${value}.label`)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="block text-sm font-medium text-light-text dark:text-dark-text">
                        {translate('editSnippetModal.form.visibility.group')}
                      </span>
                      <select
                        value={visibility === "protected" ? groupId ?? "" : ""}
                        disabled={visibility !== "protected"}
                        onChange={(e) => {
                          setGroupId(e.target.value ? Number(e.target.value) : null);
                          setHasUnsavedChanges(true);
                        }}
                        className="block w-full p-2 text-sm border rounded-md bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary disabled:opacity-60"
                      >
                        {visibility !== "protected" && <option value="">—</option>}
                        {groupOptions.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="block text-sm font-medium text-light-text dark:text-dark-text">
                        {translate('editSnippetModal.form.editPermission.label')}
                      </span>
                      <select
                        value={effectiveEditPermission}
                        onChange={(e) => {
                          setEditPermission(e.target.value as EditPermission);
                          setHasUnsavedChanges(true);
                        }}
                        className="block w-full p-2 text-sm border rounded-md bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary disabled:opacity-60"
                      >
                        {editPermissionOptions.map((value) => (
                          <option
                            key={value}
                            value={value}
                            disabled={value === "group" && visibility !== "protected"}
                          >
                            {translate(`editSnippetModal.form.editPermission.options.${value}.label`)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {translate(`editSnippetModal.form.visibility.options.${visibility}.description`)}{" "}
                    {isLocked
                      ? translate('editSnippetModal.form.editPermission.locked')
                      : translate(`editSnippetModal.form.editPermission.options.${effectiveEditPermission}.description`)}
                  </p>
                  </>
                  )}
                </div>
              )}

              {/* Code Fragments section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium text-light-text dark:text-dark-text">
                    {translate('editSnippetModal.form.codeFragments.label', { fragments: fragments.length })}
                  </label>
                  <FileUploadButton
                    onFileProcessed={handleFileUpload}
                    onError={handleUploadError}
                    existingFragments={fragments}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-4">
                  {fragments.map((fragment, index) => (
                    <FragmentEditor
                      key={index}
                      fragment={fragment}
                      onUpdate={(updated) => handleUpdateFragment(index, updated)}
                      onFileNameChange={(newName) => handleFileNameChange(index, newName)}
                      onDelete={() => handleDeleteFragment(index)}
                      showLineNumbers={showLineNumbers}
                      onMoveUp={() => moveFragment(index, "up")}
                      onMoveDown={() => moveFragment(index, "down")}
                      canMoveUp={index > 0}
                      canMoveDown={index < fragments.length - 1}
                      canDelete={fragments.length > 1}
                    />
                  ))}

                  {/* New Add Fragment button positioned below fragments */}
                  <button
                    type="button"
                    onClick={handleAddFragment}
                    className="flex items-center justify-center w-full gap-2 px-4 py-3 transition-all duration-200 border-2 border-dashed rounded-lg add-fragment-button border-light-border dark:border-dark-border hover:border-light-primary dark:hover:border-dark-primary hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary hover:text-light-primary dark:hover:text-dark-primary group"
                  >
                    <Plus
                      size={20}
                      className="transition-transform group-hover:scale-110"
                    />
                    <span className="text-sm font-medium">
                      {translate('editSnippetModal.form.codeFragments.add')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          {/* Added more specificity to footer background to avoid visible background elements in edit/create snippet mode. */}
          <div className="!bg-light-surface dark:!bg-dark-surface modal-footer -bottom-5 inset-x-0 mt-4 z-10">
            <div className="flex justify-end gap-2 py-4">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 text-sm border rounded-md bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover border-light-border dark:border-dark-border"
              >
                {t('action.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white rounded-md bg-light-primary dark:bg-dark-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {
                  isSubmitting
                    ? t('action.saving')
                    : snippetToEdit
                      ? t('action.save')
                      : t('action.addSnippet')
                }
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditSnippetModal;
