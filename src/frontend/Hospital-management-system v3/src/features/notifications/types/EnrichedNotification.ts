import { NotificationLog } from './notifications.types';

export interface EnrichedNotification extends NotificationLog {
  patientName: string;
}
