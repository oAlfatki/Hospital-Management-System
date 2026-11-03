import React, { useState, useMemo } from 'react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Badge, Button, formatCurrency, formatDate } from '@/src/core';
import {
  Users,
  CalendarDays,
  DollarSign,
  TrendingUp,
  RefreshCw,
  BriefcaseMedical
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { usePatients } from '@/src/features/patients';
import { useAppointments } from '@/src/features/appointments';
import { useBills } from '@/src/features/billing';
import { useDoctors } from '@/src/features/doctors';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const { data: patientsData, isLoading: isPatientsLoading, refetch: refetchPatients } = usePatients(1, 100);
  const patients = patientsData?.items || [];
  const { data: appointments = [], isLoading: isApptsLoading, refetch: refetchAppointments } = useAppointments();
  const { data: bills = [], isLoading: isBillsLoading, refetch: refetchBills } = useBills();
  const { data: doctors = [], isLoading: isDoctorsLoading, refetch: refetchDoctors } = useDoctors();

  const isGlobalLoading = isPatientsLoading || isApptsLoading || isBillsLoading || isDoctorsLoading;

  const handleRefresh = async () => {
    await Promise.all([
      refetchPatients(),
      refetchAppointments(),
      refetchBills(),
      refetchDoctors()
    ]);
  };

  const computedDashboardData = useMemo(() => {
    // Today YYYY-MM-DD
    const todayStr = '2026-06-29'; // Lock date for mock scenario consistency

    // KPIs
    const totalPatients = patients.filter(p => p.status === 'Active').length;
    const appointmentsToday = appointments.filter(a => a.appointmentDate === todayStr && a.status !== 'Cancelled').length;
    
    const paidRevenue = bills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + b.totalAmount, 0) + 
                        bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.paidAmount, 0);
    const pendingDues = bills.reduce((sum, b) => sum + b.pendingDue, 0);

    // Upcoming Appointments
    const upcoming = appointments
      .filter(a => a.appointmentDate >= todayStr && a.status !== 'Cancelled')
      .sort((a, b) => `${a.appointmentDate}T${a.appointmentTime}`.localeCompare(`${b.appointmentDate}T${b.appointmentTime}`))
      .slice(0, 5)
      .map(appt => {
        const pat = patients.find(p => p.patientId === appt.patientId);
        const doc = doctors.find(d => d.doctorId === appt.doctorId);
        return {
          ...appt,
          patientName: pat ? pat.name : t('unknown'),
          doctorName: doc ? doc.name : t('unknown'),
          specialty: doc ? doc.specialty : t('general'),
        };
      });

    // Revenue Chart Data
    const revMap: Record<string, number> = {
      '06-15': 237.5,
      '06-20': 200,
      '06-25': 0,
      '06-29': 0
    };
    
    const chartRev = Object.keys(revMap).map(day => ({
      date: day,
      revenue: revMap[day],
    }));

    // Appointments per doctor
    const docApptCounts = doctors.map(doc => {
      const count = appointments.filter(a => a.doctorId === doc.doctorId && a.status !== 'Cancelled').length;
      return {
        name: doc.name.replace('Dr. ', ''),
        appointments: count,
      };
    });

    return {
      stats: {
        totalPatients,
        appointmentsToday,
        monthlyRevenue: paidRevenue,
        pendingDues
      },
      upcomingAppts: upcoming,
      revenueData: chartRev,
      doctorApptData: docApptCounts
    };
  }, [patients, appointments, bills, doctors, t]);

  const { stats, upcomingAppts, revenueData, doctorApptData } = computedDashboardData;

  const translateStatus = (status: string) => {
    if (language === 'ar') {
      if (status === 'Scheduled') return 'مجدول';
      if (status === 'Rescheduled') return 'معدل';
      if (status === 'Completed') return 'مكتمل';
      if (status === 'Cancelled') return 'ملغي';
    }
    return status;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left rtl:text-right">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {language === 'ar' ? 'الأداء العيادي والتحليلات' : 'Clinical Performance & Analytics'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {language === 'ar' ? (
              <>
                مرحباً بك مجدداً، <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span> • الصلاحية: <span className="font-semibold text-emerald-500">{user?.role}</span>
              </>
            ) : (
              <>
                Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span> • Role: <span className="font-semibold text-emerald-500">{user?.role}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isGlobalLoading}
            className="h-9 gap-1.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGlobalLoading ? 'animate-spin' : ''}`} />
            {t('refreshIndicators')}
          </Button>
        </div>
      </div>

      {/* KPI Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Patients */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 text-left rtl:text-right">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('totalPatients')}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{stats.totalPatients}</h3>
            <p className="text-[10px] text-teal-600 font-semibold flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-0.5 ml-0.5" /> {t('activePatientsLabel')}
            </p>
          </div>
        </div>

        {/* Appointments Today */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 text-left rtl:text-right">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('appointmentsToday')}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{stats.appointmentsToday}</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
              {language === 'ar' ? 'التاريخ: ٢٩ يونيو، ٢٠٢٦' : 'Date: June 29, 2026'}
            </p>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 text-left rtl:text-right">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('revenueInflux')}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{formatCurrency(stats.monthlyRevenue)}</h3>
            <p className="text-[10px] text-teal-600 font-semibold flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-0.5 ml-0.5" /> {language === 'ar' ? '+٢٤٪ هذا الشهر' : '+24% this month'}
            </p>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 text-left rtl:text-right">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg shrink-0">
            <BriefcaseMedical className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('outstandingDues')}</p>
            <h3 className="text-2xl font-bold mt-1 text-slate-900">{formatCurrency(stats.pendingDues)}</h3>
            <p className="text-[10px] text-rose-500 mt-1 font-semibold">{t('requiresBillingFollowup')}</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left rtl:text-right">
        
        {/* Revenue Performance Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-850">{t('revenueInflux')}</h3>
              <p className="text-xs text-slate-400">{t('weeklyTrackedPayment')}</p>
            </div>
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">USD ($)</span>
          </div>
          
          <div className="h-64 w-full flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" name={t('revenue')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments Per Doctor Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-850">{t('physicianWorkloads')}</h3>
              <p className="text-xs text-slate-400">{t('totalConsultationsHandled')}</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">{t('visits')}</span>
          </div>

          <div className="h-64 w-full flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorApptData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="appointments" fill="#10b981" radius={[4, 4, 0, 0]} barSize={35} name={t('bookings')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming Consultations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden text-left rtl:text-right">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{t('upcomingAppointments')}</h3>
            <p className="text-xs text-slate-400">{t('quickViewNextBookings')}</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-6">{language === 'ar' ? 'معرف الموعد' : 'Appointment ID'}</th>
                <th className="py-3 px-6">{language === 'ar' ? 'المريض' : 'Patient'}</th>
                <th className="py-3 px-6">{language === 'ar' ? 'الطبيب' : 'Doctor'}</th>
                <th className="py-3 px-6">{language === 'ar' ? 'التخصص' : 'Specialty'}</th>
                <th className="py-3 px-6">{language === 'ar' ? 'التاريخ / الوقت' : 'Date / Time'}</th>
                <th className="py-3 px-6">{language === 'ar' ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {upcomingAppts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {t('noUpcomingAppointments')}
                  </td>
                </tr>
              ) : (
                upcomingAppts.map((appt) => (
                  <tr key={appt.appointmentId} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50">
                    <td className="py-3 px-6 font-mono text-xs text-slate-500 uppercase">{appt.appointmentId}</td>
                    <td className="py-3 px-6 font-semibold text-slate-900">{appt.patientName}</td>
                    <td className="py-3 px-6 text-slate-600">{appt.doctorName}</td>
                    <td className="py-3 px-6">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 text-slate-600">
                        {appt.specialty}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-slate-600">
                      {formatDate(appt.appointmentDate)} {language === 'ar' ? 'في تمام الساعة' : 'at'} {appt.appointmentTime}
                    </td>
                    <td className="py-3 px-6">
                      <Badge variant={appt.status === 'Scheduled' ? 'success' : appt.status === 'Rescheduled' ? 'warning' : 'neutral'}>
                        {translateStatus(appt.status)}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
