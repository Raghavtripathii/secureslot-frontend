export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Doctor {
  id: string;
  specialty: string;
  full_name: string;
}

export type AppointmentStatus = "booked" | "cancelled" | "completed";

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
}