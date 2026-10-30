import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../../utils/api/admin';
import { useToast } from '../../../hooks/useToast';
import { Switch } from '../../common/switch/Switch';

// Opens or closes sign-up for new accounts (password and OIDC/Google alike).
export const RegistrationToggle: React.FC = () => {
  const { t: translate } = useTranslation('components/admin/tabs/users');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getSettings(),
  });

  const mutation = useMutation({
    mutationFn: (allowNewAccounts: boolean) => adminApi.updateSettings({ allowNewAccounts }),
    onSuccess: (result) => {
      queryClient.setQueryData(['admin', 'settings'], result);
      addToast(
        result.allowNewAccounts
          ? translate('registration.success.opened')
          : translate('registration.success.closed'),
        'success'
      );
    },
    onError: (error: any) => {
      addToast(error.message || translate('registration.error'), 'error');
    },
  });

  const allowNewAccounts = !!data?.allowNewAccounts;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-3">
      <Switch
        id="allowNewAccounts"
        checked={allowNewAccounts}
        onChange={(checked) => mutation.mutate(checked)}
      />
      <label htmlFor="allowNewAccounts" className="text-sm font-medium text-light-text dark:text-dark-text">
        {translate('registration.label')}
      </label>
      <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
        {allowNewAccounts ? translate('registration.open') : translate('registration.closed')}
      </span>
    </div>
  );
};
