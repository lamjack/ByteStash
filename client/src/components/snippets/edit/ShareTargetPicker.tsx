import React, { useEffect, useMemo, useRef, useState } from "react";
import { User, UsersRound, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Group, SharePermission, ShareTarget, ShareUser } from "../../../types/snippets";
import { searchShareUsers } from "../../../utils/api/groups";

interface ShareTargetPickerProps {
  value: ShareTarget[];
  onChange: (targets: ShareTarget[]) => void;
  // Groups the user may share with
  groups: Group[];
}

type Suggestion = { type: "group" | "user"; id: number; name: string };

const keyOf = (target: { type: string; id: number }) => `${target.type}:${target.id}`;

/**
 * Multi-select of the groups and people a snippet is shared with. Groups are suggested
 * from the user's groups, people by username search; each target gets view or edit.
 */
export const ShareTargetPicker: React.FC<ShareTargetPickerProps> = ({ value, onChange, groups }) => {
  const { t: translate } = useTranslation("components/snippets/edit");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ShareUser[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setUsers([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      searchShareUsers(trimmed)
        .then((result) => {
          if (!cancelled) setUsers(Array.isArray(result) ? result : []);
        })
        .catch(() => {
          if (!cancelled) setUsers([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const suggestions = useMemo<Suggestion[]>(() => {
    const selected = new Set(value.map(keyOf));
    const needle = query.trim().toLowerCase();
    const groupMatches = groups
      .filter((group) => !needle || group.name.toLowerCase().includes(needle))
      .map((group) => ({ type: "group" as const, id: group.id, name: group.name }));
    const userMatches = users.map((user) => ({ type: "user" as const, id: user.id, name: user.username }));
    return [...groupMatches, ...userMatches].filter((s) => !selected.has(keyOf(s))).slice(0, 12);
  }, [groups, users, query, value]);

  const add = (suggestion: Suggestion) => {
    onChange([...value, { ...suggestion, permission: "view" }]);
    setQuery("");
    setOpen(false);
  };

  const update = (target: ShareTarget, permission: SharePermission) =>
    onChange(value.map((t) => (keyOf(t) === keyOf(target) ? { ...t, permission } : t)));

  const remove = (target: ShareTarget) => onChange(value.filter((t) => keyOf(t) !== keyOf(target)));

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (suggestions[0]) add(suggestions[0]);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={translate("editSnippetModal.form.share.placeholder")}
          aria-label={translate("editSnippetModal.form.share.label")}
          className="block w-full p-2 text-sm border rounded-md bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary"
        />
        {open && (suggestions.length > 0 || query.trim()) && (
          <ul
            role="listbox"
            className="absolute z-20 w-full mt-1 overflow-y-auto border rounded-md shadow-lg max-h-56 bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border"
          >
            {suggestions.length === 0 && (
              <li className="px-3 py-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {translate("editSnippetModal.form.share.noMatches")}
              </li>
            )}
            {suggestions.map((suggestion) => (
              <li key={keyOf(suggestion)} role="option" aria-selected={false}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(suggestion)}
                  className="flex items-center w-full gap-2 px-3 py-2 text-sm text-left text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover"
                >
                  {suggestion.type === "group" ? <UsersRound size={14} aria-hidden="true" /> : <User size={14} aria-hidden="true" />}
                  <span className="truncate">{suggestion.name}</span>
                  <span className="ml-auto text-xs text-light-text-secondary dark:text-dark-text-secondary">
                    {translate(`editSnippetModal.form.share.type.${suggestion.type}`)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {value.length === 0 ? (
        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
          {translate("editSnippetModal.form.share.empty")}
        </p>
      ) : (
        <ul className="space-y-1">
          {value.map((target) => (
            <li
              key={keyOf(target)}
              className="flex items-center gap-2 px-2 py-1 text-sm rounded-md bg-light-hover/50 dark:bg-dark-hover/50 text-light-text dark:text-dark-text"
            >
              {target.type === "group" ? <UsersRound size={14} aria-hidden="true" /> : <User size={14} aria-hidden="true" />}
              <span className="truncate">{target.name ?? `#${target.id}`}</span>
              <select
                value={target.permission}
                onChange={(e) => update(target, e.target.value as SharePermission)}
                aria-label={translate("editSnippetModal.form.share.permissionFor", { name: target.name ?? target.id })}
                className="p-1 ml-auto text-xs border rounded bg-light-surface dark:bg-dark-surface text-light-text dark:text-dark-text border-light-border dark:border-dark-border"
              >
                <option value="view">{translate("editSnippetModal.form.share.permission.view")}</option>
                <option value="edit">{translate("editSnippetModal.form.share.permission.edit")}</option>
              </select>
              <button
                type="button"
                onClick={() => remove(target)}
                aria-label={translate("editSnippetModal.form.share.remove", { name: target.name ?? target.id })}
                className="p-1 rounded text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
