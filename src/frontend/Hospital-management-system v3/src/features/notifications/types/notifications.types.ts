export interface NotificationLog {
  notificationId: string;
  patientId: string;
  userId?: string;
  type: 'Email' | 'SMS';
  message: string;
  status: 'Sent' | 'Failed' | 'Pending';
  sentOn: string | null;
  deliveryConfirmation: boolean;
  retries: number;
}
