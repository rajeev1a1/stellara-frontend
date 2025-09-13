import { IAuthRepository, LoginCredentials } from '../repositories/IAuthRepository';
import { User } from '../entities/User';

export interface LoginResult {
  isSuccess: boolean;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export class LoginUser {
  constructor(private authRepository: IAuthRepository) {}

  async execute(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        return {
          isSuccess: false,
          error: 'Invalid email format',
        };
      }

      // Validate password requirements
      const password = credentials.password;
      if (password.length < 8) {
        return {
          isSuccess: false,
          error: 'Password must be at least 8 characters long',
        };
      }
      if (!/[A-Z]/.test(password)) {
        return {
          isSuccess: false,
          error: 'Password must contain at least one uppercase letter',
        };
      }
      if (!/[!@#$%^&*(),.?":{}|<>~`\-_+=\[\]\\;']/.test(password)) {
        return {
          isSuccess: false,
          error: 'Password must contain at least one special character',
        };
      }

      // Attempt login
      const result = await this.authRepository.login(credentials);
      
      // Store tokens on successful login
      await this.authRepository.storeTokens(result.tokens);

      return {
        isSuccess: true,
        user: result.user,
        tokens: result.tokens,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return {
          isSuccess: false,
          error: 'Invalid credentials',
        };
      }

      return {
        isSuccess: false,
        error: 'Login failed. Please try again.',
      };
    }
  }
}