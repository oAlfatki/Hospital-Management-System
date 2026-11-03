import * as yup from 'yup';

export const RescheduleAppointmentSchema = yup.object().shape({
  appointmentDate: yup.string().required('New date is required'),
  appointmentTime: yup.string().required('New time is required'),
});
