import React from "react";
import { Pencil, Share, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SnippetDetailActionsProps {
  onEdit: () => void;
  // Owner-only actions; omitted for group editors
  onShare?: () => void;
  onDelete?: () => void;
}

export const SnippetDetailActions: React.FC<SnippetDetailActionsProps> = ({
  onEdit,
  onShare,
  onDelete,
}) => {
  const { t: translate } = useTranslation("components/snippets/list/snippetCardMenu");
  const actions = [
    { label: translate("editSnippet"), icon: <Pencil size={16} />, onClick: onEdit },
    onShare && { label: translate("shareSnippet"), icon: <Share size={16} />, onClick: onShare },
    onDelete && { label: translate("deleteSnippet"), icon: <Trash2 size={16} />, onClick: onDelete, isDelete: true },
  ].filter((action): action is { label: string; icon: React.ReactElement; onClick: () => void; isDelete?: boolean } => !!action);

  return (
    <div className="flex items-center gap-2">
      {actions.map(({ label, icon, onClick, isDelete }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          aria-label={label}
          className={`flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-light-text-secondary transition-colors hover:bg-light-surface hover:text-light-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-light-primary dark:text-dark-text-secondary dark:hover:bg-dark-surface dark:hover:text-dark-text dark:focus-visible:ring-dark-primary ${
            isDelete ? "hover:text-red-600 dark:hover:text-red-400" : ""
          }`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};
