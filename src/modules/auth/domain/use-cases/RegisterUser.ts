import { IAuthRepository, RegisterData } from '../repositories/IAuthRepository';
import { User } from '../entities/User';

export interface RegisterResult {
  isSuccess: boolean;
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
}

export class RegisterUser {
  constructor(private authRepository: IAuthRepository) {}

  async execute(data: RegisterData): Promise<RegisterResult> {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        return {
          isSuccess: false,
          error: 'Invalid email format',
        };
      }

      // Validate password requirements
      const password = data.password;
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

      // Validate first name
      if (!data.firstName.trim()) {
        return {
          isSuccess: false,
          error: 'First name is required',
        };
      }

      // Validate last name
      if (!data.lastName.trim()) {
        return {
          isSuccess: false,
          error: 'Last name is required',
        };
      }

      // Attempt registration
      const result = await this.authRepository.register(data);
      
      // Store tokens on successful registration
      await this.authRepository.storeTokens(result.tokens);

      return {
        isSuccess: true,
        user: result.user,
        tokens: result.tokens,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists') {
        return {
          isSuccess: false,
          error: 'User already exists',
        };
      }

      return {
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      };
    }
  }
}