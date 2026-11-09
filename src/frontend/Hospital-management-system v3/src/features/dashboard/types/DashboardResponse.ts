export interface DashboardResponse {
  financeVisible: boolean;
  stats: { totalPatients: number; appointmentsToday: number; monthlyRevenue: number | null; pendingDues: number | null };
  upcomingAppts: { appointmentId: string; appointmentDate: string; appointmentTime: string; status: string; patientName: string; doctorName: string; specialty: string }[];
  revenueData: { date: string; revenue: number }[];
  doctorApptData: { name: string; appointments: number }[];
}
