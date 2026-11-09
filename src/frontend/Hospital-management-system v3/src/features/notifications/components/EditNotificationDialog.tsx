import { Dialog, Button, Input, Select } from '@/src/core';
import { useLanguage } from '@/src/core/providers';
import type { NotificationLog } from '../types/notifications.types';
import { useNotificationForm } from '../hooks/useNotificationForm';
export function EditNotificationDialog({ notification, onClose }: { notification: NotificationLog | null; onClose: () => void }) {
  const { t } = useLanguage();
  const { form, onSubmit: submit, isSubmitting } = useNotificationForm(notification, onClose);
  const { register, formState: { errors } } = form;
  return <Dialog isOpen={!!notification} onClose={onClose} title={t('editNotification')} footer={
    <><Button variant="outline" onClick={onClose}>{t('commonCancel')}</Button><Button disabled={isSubmitting} onClick={submit}>{t('saveChangesAction')}</Button></>
  }>
    <form onSubmit={submit} className="space-y-4">
      <Input label={t('notificationMessage')} {...register('message', { required: t('notificationMessage'), maxLength: 1000, validate: value => value.trim().length > 0 })} error={errors.message?.message} />
      <Select label={t('notificationType')} {...register('type', { required: true })} options={[{ value: 'Email', label: 'Email' }, { value: 'SMS', label: 'SMS' }]} />
    </form>
  </Dialog>;
}
