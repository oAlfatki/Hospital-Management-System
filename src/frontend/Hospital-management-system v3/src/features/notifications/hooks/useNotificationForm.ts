import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/src/core/providers';
import type { NotificationLog } from '../types/notifications.types';
import type { NotificationUpdateRequest } from '../types/NotificationUpdateRequest';
import { useUpdateNotification } from './useUpdateNotification';
import toast from 'react-hot-toast';
export function useNotificationForm(notification: NotificationLog | null, onClose: () => void) {
  const { t } = useLanguage();
  const mutation = useUpdateNotification();
  const form = useForm<NotificationUpdateRequest>();
  const { reset, handleSubmit } = form;
  useEffect(() => { if (notification) reset({ message: notification.message, type: notification.type }); }, [notification, reset]);
  const onSubmit = handleSubmit(request => {
    if (notification) mutation.mutate({ id: notification.notificationId, request }, {
      onSuccess: () => { toast.success(t('saveChangesAction')); onClose(); },
      onError: (error: Error) => toast.error(error.message),
    });
  });
  return { form, onSubmit, isSubmitting: mutation.isPending };
}
