export interface NotificationResponse {
  notificationId: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  status: 'Sent' | 'Delivered' | 'Failed' | 'Unread' | 'Read';
}
