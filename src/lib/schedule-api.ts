import { apiRequest } from "./api";

export type ScheduleUserInfo = {
  _id?: string;
  email?: string;
  id?: string;
  mobile?: string;
  name?: string;
  profileImage?: string;
  role?: "investor" | "investee" | "superadmin" | string;
};

export type Schedule = {
  _id: string;
  conversation?: string | { _id?: string } | null;
  createdAt?: string;
  createdBy?: ScheduleUserInfo | null;
  dateTime?: string;
  endsAt?: string;
  investee?: ScheduleUserInfo | null;
  investor?: ScheduleUserInfo | null;
  location?: string;
  locationDetails?: string;
  note?: string;
  startsAt?: string;
  timeZone?: string;
  title?: string;
  updatedAt?: string;
};

export type ScheduleFilters = {
  conversationId?: string;
  from?: string;
  investeeId?: string;
  investorId?: string;
  to?: string;
};

export type SchedulePayload = {
  conversationId?: string;
  dateTime?: string;
  endsAt?: string;
  investeeId?: string;
  investorId?: string;
  location?: string;
  locationDetails?: string;
  note?: string;
  startsAt?: string;
  timeZone?: string;
  title?: string;
};

type ScheduleEnvelope<T> = {
  data?: T;
  message?: string;
  success?: boolean;
};

export function getSchedules(params: ScheduleFilters = {}) {
  return apiRequest<ScheduleEnvelope<Schedule[]>>({
    method: "GET",
    params,
    url: "schedules",
  });
}

export function getSchedule(scheduleId: string) {
  return apiRequest<ScheduleEnvelope<Schedule>>({
    method: "GET",
    url: `schedules/${scheduleId}`,
  });
}

export function createSchedule(data: SchedulePayload) {
  return apiRequest<ScheduleEnvelope<Schedule>>({
    data,
    method: "POST",
    url: "schedules",
  });
}

export function updateSchedule(scheduleId: string, data: Partial<SchedulePayload>) {
  return apiRequest<ScheduleEnvelope<Schedule>>({
    data,
    method: "PATCH",
    url: `schedules/${scheduleId}`,
  });
}

export function deleteSchedule(scheduleId: string) {
  return apiRequest<ScheduleEnvelope<{ id?: string; message?: string }>>({
    method: "DELETE",
    url: `schedules/${scheduleId}`,
  });
}
