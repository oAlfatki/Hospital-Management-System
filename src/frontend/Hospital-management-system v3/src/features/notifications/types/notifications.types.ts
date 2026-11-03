export interface NotificationLog {
  notificationId: string;
  patientId: string;
  userId?: string;
  type: 'Email' | 'SMS';
  message: string;
  status: 'Sent' | 'Failed' | 'Pending';
  sentOn: string;
  deliveryConfirmation: boolean;
  retries: number;
}
