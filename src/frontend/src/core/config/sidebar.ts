import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  CreditCard,
  Stethoscope,
  Bell,
  ScrollText,
  UserCog,
} from 'lucide-react';

export const SIDEBAR_ITEMS = [
  {
    id: 'dashboard',
    path: '/dashboard',
    labelKey: 'dashboard',
    icon: LayoutDashboard,
    allowedRoles: [
      'Admin',
      'Doctor',
      'Nurse',
      'Management',
      'Accounts',
    ],
  },

  {
    id: 'patients',
    path: '/patients',
    labelKey: 'patientsDirectory',
    icon: Users,
    allowedRoles: [
      'Admin',
      'Doctor',
      'Nurse',
      'Management',
    ],
  },

  {
    id: 'appointments',
    path: '/appointments',
    labelKey: 'appointments',
    icon: CalendarDays,
    allowedRoles: [
      'Admin',
      'Doctor',
      'Nurse',
      'Management',
    ],
  },

  {
    id: 'records',
    path: '/records',
    labelKey: 'medicalRecords',
    icon: FileText,
    allowedRoles: [
      'Doctor',
      'Nurse',
    ],
  },

  {
    id: 'billing',
    path: '/billing',
    labelKey: 'billingInvoicing',
    icon: CreditCard,
    allowedRoles: [
      'Admin',
      'Accounts',
      'Management',
    ],
  },

  {
    id: 'doctors',
    path: '/doctors',
    labelKey: 'doctorsStaff',
    icon: Stethoscope,
    allowedRoles: [
      'Admin',
      'Management',
    ],
  },

  {
    id: 'users',
    path: '/users',
    labelKey: 'userManagement',
    icon: UserCog,
    allowedRoles: ['Admin'],
  },

  {
    id: 'notifications',
    path: '/notifications',
    labelKey: 'notificationLogs',
    icon: Bell,
    allowedRoles: [
      'Admin',
      'Management',
    ],
  },

  {
    id: 'audit',
    path: '/audit',
    labelKey: 'systemAuditLogs',
    icon: ScrollText,
    allowedRoles: [
      'Admin',
      'Management',
    ],
  },
];

export const getSidebarItemsForRole = (role: string) => {
  return SIDEBAR_ITEMS.filter((item) =>
    item.allowedRoles.includes(role)
  );
};