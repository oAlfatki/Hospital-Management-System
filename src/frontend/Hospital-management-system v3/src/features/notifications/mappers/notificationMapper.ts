import type { NotificationLog } from '../types/notifications.types';
import type { NotificationResponse } from '../types/NotificationResponse';

export const NotificationMapper = {
  toDomain(res: NotificationResponse | NotificationLog): NotificationLog {
    if ('patientId' in res) {
      return { ...res };
    }
    return {
      notificationId: res.notificationId,
      patientId: res.recipientId,
      userId: res.recipientId,
      type: res.type === 'SMS' ? 'SMS' : 'Email',
      message: res.message,
      status: res.status === 'Failed' ? 'Failed' : res.status === 'Sent' ? 'Sent' : 'Pending',
      sentOn: res.timestamp,
      deliveryConfirmation: res.status === 'Delivered' || res.status === 'Read',
      retries: 0,
    };
  },

  toDomainList(logs: (NotificationResponse | NotificationLog)[]): NotificationLog[] {
    return logs.map((l) => this.toDomain(l));
  },
};
