// Common type definitions for the PrepAcademy server application

// Re-export environment types
export * from './environment';

// Express request extensions
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Unified JWT payload for consistent typing across the application
export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  userType?: 'student' | 'parent';
  role?: string;
  expertise?: string[];
  tokenType?: string;
  _id?: string; // Alias for userId for backward compatibility
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// Legacy interface for backward compatibility
export interface TokenPayload extends JwtPayload {
  id: string;
  role: 'student' | 'admin' | 'instructor';
}

// Common response structures
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// Common pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Common sort parameters
export interface SortParams {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Common filter parameters
export interface FilterParams {
  [key: string]: string | string[] | number | boolean | undefined;
}

// Common request parameters
export interface RequestParams extends PaginationParams, SortParams, FilterParams {}

// User roles
export type UserRole = 'student' | 'instructor' | 'admin' | 'expert';

// Common subject types
export type Subject = 'Math' | 'Reading' | 'Writing' | 'English' | 'Science' | 'SAT' | 'ACT' | 'General';

// Common difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Common content visibility
export type ContentVisibility = 'public' | 'private' | 'group';

// Common content types
export type ContentType = 'question' | 'exam' | 'hint' | 'explanation';

// Common review status
export type ReviewStatus = 'pending' | 'reviewed' | 'updated' | 'rejected';

// Add more common server types as needed 