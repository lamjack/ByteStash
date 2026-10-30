import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Pencil, Trash2, UserMinus, UserPlus, Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../../utils/api/admin';
import { useToast } from '../../../hooks/useToast';
import { ConfirmationModal } from '../../common/modals/ConfirmationModal';
import { FilterInput, AdminTable, formatDate, type TableColumn } from '../common';

const buttonClass =
  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium bg-light-primary dark:bg-dark-primary text-white hover:opacity-90 disabled:opacity-50';
const iconButtonClass = 'p-1 hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary rounded';

const GroupMembersPanel: React.FC<{ group: any; onClose: () => void }> = ({ group, onClose }) => {
  const { t: translate } = useTranslation('components/admin/tabs/groups');
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [identifier, setIdentifier] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'groups', group.id, 'members'],
    queryFn: () => adminApi.getGroupMembers(group.id),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
  };

  const addMutation = useMutation({
    mutationFn: (value: string) => adminApi.addGroupMember(group.id, value),
    onSuccess: (result) => {
      addToast(
        result.type === 'invite'
          ? translate('members.success.invited', { email: result.email })
          : translate('members.success.added', { username: result.username }),
        'success'
      );
      setIdentifier('');
      refresh();
    },
    onError: (error: any) => {
      addToast(error.message || translate('members.error.add'), 'error');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => adminApi.removeGroupMember(group.id, userId),
    onSuccess: refresh,
    onError: (error: any) => addToast(error.message || translate('members.error.remove'), 'error'),
  });

  const removeInviteMutation = useMutation({
    mutationFn: (email: string) => adminApi.removeGroupInvite(group.id, email),
    onSuccess: refresh,
    onError: (error: any) => addToast(error.message || translate('members.error.remove'), 'error'),
  });

  const members = data?.members || [];
  const invites = data?.invites || [];

  return (
    <div className="space-y-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-light-text dark:text-dark-text">
          <Users className="w-4 h-4" />
          {translate('members.title', { name: group.name })}
        </h3>
        <button onClick={onClose} className={iconButtonClass} title={translate('members.close')}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <form
        className="flex flex-col sm:flex-row gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (identifier.trim()) addMutation.mutate(identifier.trim());
        }}
      >
        <FilterInput
          value={identifier}
          onChange={setIdentifier}
          placeholder={translate('members.addPlaceholder')}
          className="flex-1"
        />
        <button type="submit" className={buttonClass} disabled={!identifier.trim() || addMutation.isPending}>
          <UserPlus className="w-4 h-4" />
          {translate('members.add')}
        </button>
      </form>
      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
        {translate('members.addHint')}
      </p>

      {isLoading ? (
        <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{translate('members.loading')}</p>
      ) : (
        <ul className="divide-y divide-light-border dark:divide-dark-border">
          {members.length === 0 && invites.length === 0 && (
            <li className="py-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {translate('members.empty')}
            </li>
          )}
          {members.map((member: any) => (
            <li key={`u-${member.id}`} className="flex items-center justify-between py-2 text-sm">
              <span className="text-light-text dark:text-dark-text">
                {member.username}
                {member.email && (
                  <span className="ml-2 text-light-text-secondary dark:text-dark-text-secondary">{member.email}</span>
                )}
              </span>
              <button
                onClick={() => removeMemberMutation.mutate(member.id)}
                className={`${iconButtonClass} text-red-600 dark:text-red-400`}
                title={translate('members.remove')}
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </li>
          ))}
          {invites.map((invite: any) => (
            <li key={`i-${invite.email}`} className="flex items-center justify-between py-2 text-sm">
              <span className="flex items-center gap-2 text-light-text-secondary dark:text-dark-text-secondary">
                <Mail className="w-4 h-4" />
                {invite.email}
                <span className="rounded bg-light-hover dark:bg-dark-hover px-1.5 py-0.5 text-xs">
                  {translate('members.pending')}
                </span>
              </span>
              <button
                onClick={() => removeInviteMutation.mutate(invite.email)}
                className={`${iconButtonClass} text-red-600 dark:text-red-400`}
                title={translate('members.cancelInvite')}
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const GroupsTab: React.FC = () => {
  const { t } = useTranslation();
  const { t: translate } = useTranslation('components/admin/tabs/groups');
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['admin', 'groups'],
    queryFn: () => adminApi.getGroups(),
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId
        ? adminApi.updateGroup(editingId, { name: name.trim(), description: description.trim() })
        : adminApi.createGroup({ name: name.trim(), description: description.trim() }),
    onSuccess: () => {
      addToast(editingId ? translate('success.update') : translate('success.create'), 'success');
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
    },
    onError: (error: any) => {
      addToast(error.message || translate('error.save'), 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteGroup(id),
    onSuccess: (_, id) => {
      addToast(translate('success.delete'), 'success');
      if (selectedGroupId === id) setSelectedGroupId(null);
      setDeleteGroupId(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
    },
    onError: (error: any) => {
      addToast(error.message || translate('error.delete'), 'error');
    },
  });

  const selectedGroup = groups.find((group: any) => group.id === selectedGroupId);

  const columns: TableColumn<any>[] = [
    {
      key: 'name',
      label: translate('columns.name'),
      render: (group) => (
        <div className="text-light-text dark:text-dark-text">
          <div className="font-medium">{group.name}</div>
          {group.description && (
            <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">{group.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'member_count',
      label: translate('columns.members'),
      render: (group) => (
        <span className="whitespace-nowrap text-light-text-secondary dark:text-dark-text-secondary">
          {group.member_count}
          {group.invite_count > 0 && ` (+${translate('columns.invites', { count: group.invite_count })})`}
        </span>
      ),
    },
    {
      key: 'snippet_count',
      label: translate('columns.snippets'),
      render: (group) => (
        <span className="whitespace-nowrap text-light-text-secondary dark:text-dark-text-secondary">
          {group.snippet_count}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: translate('columns.created'),
      render: (group) => (
        <span className="whitespace-nowrap text-light-text-secondary dark:text-dark-text-secondary">
          {formatDate(group.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: translate('columns.actions'),
      render: (group) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            onClick={() => setSelectedGroupId(group.id)}
            className={iconButtonClass}
            title={translate('action.members')}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditingId(group.id);
              setName(group.name);
              setDescription(group.description || '');
            }}
            className={iconButtonClass}
            title={translate('action.edit')}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteGroupId(group.id)}
            className={`${iconButtonClass} text-red-600 dark:text-red-400`}
            title={translate('action.delete')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{translate('intro')}</p>

      <form
        className="flex flex-col sm:flex-row gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) saveMutation.mutate();
        }}
      >
        <FilterInput value={name} onChange={setName} placeholder={translate('form.name')} className="sm:w-64" />
        <FilterInput
          value={description}
          onChange={setDescription}
          placeholder={translate('form.description')}
          className="flex-1"
        />
        <button type="submit" className={buttonClass} disabled={!name.trim() || saveMutation.isPending}>
          {editingId ? translate('form.save') : translate('form.create')}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-md px-3 py-1.5 text-sm text-light-text dark:text-dark-text hover:bg-light-hover dark:hover:bg-dark-hover"
          >
            {t('action.cancel')}
          </button>
        )}
      </form>

      <AdminTable
        columns={columns}
        data={groups}
        isLoading={isLoading}
        emptyMessage={translate('table.emptyMessage')}
        loadingMessage={translate('table.loadingMessage')}
        getRowKey={(group) => group.id}
      />

      {selectedGroup && <GroupMembersPanel group={selectedGroup} onClose={() => setSelectedGroupId(null)} />}

      <ConfirmationModal
        isOpen={deleteGroupId !== null}
        onClose={() => setDeleteGroupId(null)}
        onConfirm={() => deleteGroupId && deleteMutation.mutate(deleteGroupId)}
        title={translate('confirmationModal.title')}
        message={translate('confirmationModal.message')}
        confirmLabel={t('action.delete')}
        cancelLabel={t('action.cancel')}
        variant="danger"
      />
    </div>
  );
};
