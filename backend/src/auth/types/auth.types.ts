import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: Role;
  loyaltyPoints: number;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: SafeUser;
}

export interface AuthenticatedRequest {
  user: SafeUser;
}
