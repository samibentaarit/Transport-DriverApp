import { Incident, Message, NotificationItem, Trip, TripLiveStatus, User } from "@/types/models";

export type ApiValidationErrors = Record<string, string[]>;

export type ApiErrorShape = {
  message: string;
  errors?: ApiValidationErrors;
};

export type ResourceResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResourceResponse<T> = {
  data: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    unread_count?: number;
  };
  links?: Record<string, string | null>;
};

export type AuthSession = {
  accessToken: string;
  tokenType: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
  deviceInfo: {
    name: string;
    platform: string;
  };
};

export type LoginResponse = {
  token: string;
  token_type: string;
  user: User;
};

export type UpdateProfilePayload = {
  name?: string;
  phone?: string | null;
  password?: string;
  password_confirmation?: string;
};

export type TodayTripsResponse = PaginatedResourceResponse<Trip>;
export type NotificationsResponse = PaginatedResourceResponse<NotificationItem>;
export type MessagesResponse = PaginatedResourceResponse<Message>;
export type TripLiveResponse = ResourceResponse<TripLiveStatus>;
export type IncidentListResponse = PaginatedResourceResponse<Incident>;

