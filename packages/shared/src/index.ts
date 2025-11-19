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

// TODO: Add cross-cutting DTOs and validation schemas when features land.
