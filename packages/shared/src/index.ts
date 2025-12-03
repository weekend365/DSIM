export type ApiResponse<T = unknown> = {
  message: string;
  data?: T;
  errors?: string[];
  meta?: Record<string, unknown>;
};

export type Identifier = string & { readonly brand?: unique symbol };

export enum UserRole {
  Traveler = 'traveler',
  Guide = 'guide',
  Admin = 'admin'
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export type Nullable<T> = T | null | undefined;

export interface HealthCheckResponse extends ApiResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
}

export interface SignInRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpRequest extends SignInRequest {
  name: string;
  rememberMe?: boolean;
}

export interface AuthTokenPayload {
  accessToken: string;
  expiresIn: number;
}

export type SignInResponse = ApiResponse<AuthTokenPayload>;
export type SignUpResponse = ApiResponse<AuthTokenPayload>;

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole | string;
  iat?: number;
  exp?: number;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  passwordHash: string;
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string | null;
  location?: string | null;
  interests?: string | null;
  languages?: string | null;
  avatarUrl?: string | null;
  travelStyles?: string[] | null;
  travelPace?: string | null;
  budgetPreference?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TravelPost {
  id: string;
  title: string;
  description?: string | null;
  destination: string;
  startDate?: string | null | Date;
  endDate?: string | null | Date;
  budget?: number | null;
  creatorId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  creator?: {
    id: string;
    email: string;
    name: string;
  };
}

// TODO: Add cross-cutting DTOs and validation schemas when features land.
