import { User } from '../entities/User';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  register(data: RegisterData): Promise<AuthResult>;
  refresh(refreshToken: string): Promise<{ accessToken: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  storeTokens(tokens: AuthTokens): Promise<void>;
  getStoredTokens(): Promise<AuthTokens | null>;
  clearTokens(): Promise<void>;
}