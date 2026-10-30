import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../../../constants/routes";
import { useAuth } from "../../../../hooks/useAuth";
import { useSettings } from "../../../../hooks/useSettings";
import { useEditSnippet, useMoveToRecycleBin } from "../../../../hooks/useSnippetsQuery";
import { useToast } from "../../../../hooks/useToast";
import { snippetService } from "../../../../service/snippetService";
import { Snippet } from "../../../../types/snippets";
import { EMPTY_SNIPPET_METADATA, type SnippetMetadata } from "../../../../types/metadata";
import { getSnippetById, getPublicSnippetById } from "../../../../utils/api/snippets";
import { ConfirmationModal } from "../../../common/modals/ConfirmationModal";
import { PageContainer } from "../../../common/layout/PageContainer";
import EditSnippetModal from "../../edit/EditSnippetModal";
import { ShareMenu } from "../../share/ShareMenu";
import { FullCodeView } from "../FullCodeView";
import { SnippetDetailActions } from "./SnippetDetailActions";

interface SnippetPageLocationState {
  from?: string;
}

const AuthAwareSnippetView: React.FC = () => {
  const { t: translate } = useTranslation("components/snippets/view/common");
  const { snippetId } = useParams<{ snippetId: string }>();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [metadata, setMetadata] = useState<SnippetMetadata>(EMPTY_SNIPPET_METADATA);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [tryingPublicAccess, setTryingPublicAccess] = useState(false);
  const [isEditSnippetModalOpen, setIsEditSnippetModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showLineNumbers } = useSettings();
  const { addToast } = useToast();
  const editSnippetMutation = useEditSnippet();
  const moveToRecycleBinMutation = useMoveToRecycleBin();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { t: translateCard } = useTranslation("components/snippets/list/snippetCard");
  const locationState = location.state as SnippetPageLocationState | null;
  const fallbackPath = isAuthenticated ? ROUTES.HOME : ROUTES.PUBLIC_SNIPPETS;
  const returnPath = locationState?.from || fallbackPath;

  useEffect(() => {
    loadSnippet();
  }, [snippetId, isAuthenticated, user?.id]);

  const loadSnippet = async () => {
    if (!snippetId) return;

    setIsLoading(true);
    setError(null);
    setTryingPublicAccess(false);
    setRequiresAuth(false);
    setIsOwned(false);
    setCanEdit(false);

    try {
      if (isAuthenticated) {
        const data = await getSnippetById(snippetId);
        setSnippet(data);
        // Signed-in users can also read public and group snippets. Only the owner may share
        // or delete; group members may edit when the owner allows it.
        const owned = data.is_owner ?? data.user_id === user?.id;
        setIsOwned(owned);
        // The owner keeps the edit button on read-only snippets so they can unlock them
        setCanEdit(owned || !!data.can_edit);
        return;
      }

      setIsOwned(false);
      setTryingPublicAccess(true);
      const publicData = await getPublicSnippetById(snippetId);
      setSnippet(publicData);
    } catch (err: any) {
      setIsOwned(false);
      if (err.status === 401 || err.status === 403) {
        setRequiresAuth(true);
        if (!tryingPublicAccess) {
          try {
            const publicData = await getPublicSnippetById(snippetId);
            setSnippet(publicData);
            setIsOwned(false);
            setRequiresAuth(false);
            setError(null);
            return;
          } catch {
            setError(translate("authAwareSnippetView.error.snippetRequireAuth"));
          }
        } else {
          setError(translate("authAwareSnippetView.error.snippetRequireAuth"));
        }
      } else {
        setError(err.message || translate("authAwareSnippetView.error.snippetLoad"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOwned) return;

    const fetchMetadata = async () => {
      try {
        const data = await snippetService.getSnippetsMetadata();
        setMetadata(data);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };

    fetchMetadata();
  }, [isOwned]);

  const handleSnippetSubmit = async (
    snippetData: Omit<Snippet, "id" | "updated_at">
  ) => {
    if (!snippet) return;

    try {
      const updated = await editSnippetMutation.mutateAsync({
        id: snippet.id,
        snippet: snippetData,
      });
      setSnippet(updated ? { ...updated, is_owner: snippet.is_owner, can_edit: snippet.can_edit } : { ...snippet, ...snippetData });
      addToast(translate("baseSnippetStorage.success.snippetUpdated"), "success");
    } catch (error: any) {
      addToast(error?.error || translate("baseSnippetStorage.error.snippetUpdated"), "error");
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!snippet) return;

    try {
      await moveToRecycleBinMutation.mutateAsync(snippet.id);
      addToast(
        translate("snippetContentArea.success.moveSnippetToRecycleBin"),
        "success"
      );
      navigate(returnPath);
    } catch {
      addToast(
        translate("snippetContentArea.error.moveSnippetToRecycleBin"),
        "error"
      );
    }
  };

  const handleBack = () => {
    if (locationState?.from) {
      navigate(-1);
      return;
    }
    navigate(fallbackPath);
  };

  const handleCategoryClick = (category: string) => {
    const [pathname, query = ""] = returnPath.split("?");
    const searchParams = new URLSearchParams(query);
    searchParams.set("categories", category);
    navigate(`${pathname}?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <PageContainer className="max-w-6xl">
        <div className="animate-pulse space-y-5 py-5" aria-label={translate("loadingSnippets")}>
          <div className="h-10 w-40 rounded-lg bg-light-surface dark:bg-dark-surface" />
          <div className="h-44 rounded-xl bg-light-surface dark:bg-dark-surface" />
          <div className="h-72 rounded-xl bg-light-surface dark:bg-dark-surface" />
        </div>
      </PageContainer>
    );
  }

  if (requiresAuth && !isAuthenticated) {
    return (
      <PageContainer className="max-w-3xl">
        <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">
            {translate("authAwareSnippetView.error.snippetRequireAuth")}
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-lg bg-light-primary px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary focus-visible:ring-offset-2 dark:bg-dark-primary dark:focus-visible:ring-dark-primary dark:focus-visible:ring-offset-dark-bg"
            >
              {translate("signIn")}
            </Link>
            <Link
              to={ROUTES.PUBLIC_SNIPPETS}
              className="rounded-lg bg-light-surface px-4 py-2 font-medium text-light-text transition-colors hover:bg-light-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-hover dark:focus-visible:ring-dark-primary"
            >
              {translate("browsePublicSnippets")}
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !snippet) {
    return (
      <PageContainer className="max-w-3xl">
        <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 text-center">
          <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">
            {error || translate("sippetNotFound")}
          </h1>
          <Link
            to={returnPath}
            className="font-medium text-light-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:text-dark-text dark:focus-visible:ring-dark-primary"
          >
            {translate("backToSnippets")}
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-6xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-light-text-secondary transition-colors hover:bg-light-surface hover:text-light-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:text-dark-text-secondary dark:hover:bg-dark-surface dark:hover:text-dark-text dark:focus-visible:ring-dark-primary"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {translate("backToSnippets")}
        </button>
        {canEdit && snippet && (
          <SnippetDetailActions
            onEdit={() => setIsEditSnippetModalOpen(true)}
            onShare={isOwned ? () => setIsShareOpen(true) : undefined}
            onDelete={isOwned ? () => setIsDeleteConfirmOpen(true) : undefined}
          />
        )}
      </div>
      <main id="main-content">
        <FullCodeView
          snippet={snippet}
          showLineNumbers={showLineNumbers}
          onCategoryClick={handleCategoryClick}
        />
      </main>
      {canEdit && snippet && (
        <EditSnippetModal
          isOpen={isEditSnippetModalOpen}
          onClose={() => setIsEditSnippetModalOpen(false)}
          onSubmit={handleSnippetSubmit}
          snippetToEdit={snippet}
          showLineNumbers={showLineNumbers}
          allCategories={metadata.categories}
          isOwner={isOwned}
        />
      )}
      {isOwned && snippet && (
        <>
          <ShareMenu
            snippet={snippet}
            isOpen={isShareOpen}
            onClose={() => setIsShareOpen(false)}
          />
          <ConfirmationModal
            isOpen={isDeleteConfirmOpen}
            onClose={() => setIsDeleteConfirmOpen(false)}
            onConfirm={handleDeleteConfirm}
            title={translateCard("confirmationModalDelete.title.isRecycleView.false")}
            message={translateCard("confirmationModalDelete.message.isRecycleView.false", {
              title: snippet.title,
            })}
            confirmLabel={translateCard("confirmationModalDelete.confirmLabel.isRecycleView.false")}
            cancelLabel={t("action.cancel")}
            variant="danger"
          />
        </>
      )}
    </PageContainer>
  );
};

export default AuthAwareSnippetView;
