import * as yup from 'yup';

export const ScheduleAppointmentSchema = yup.object().shape({
  patientId: yup.string().required('Patient selection is required'),
  doctorId: yup.string().required('Physician selection is required'),
  appointmentDate: yup.string().required('Date is required'),
  appointmentTime: yup.string().required('Time is required'),
  durationMinutes: yup
    .number()
    .min(15, 'Duration must be at least 15 minutes')
    .required('Duration is required'),
});
