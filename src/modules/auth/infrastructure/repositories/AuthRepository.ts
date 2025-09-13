import * as SecureStore from 'expo-secure-store';
import axios, { AxiosResponse } from 'axios';
import { 
  IAuthRepository, 
  LoginCredentials, 
  RegisterData, 
  AuthResult, 
  AuthTokens 
} from '../../domain/repositories/IAuthRepository';
import { User } from '../../domain/entities/User';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    subscriptionTier: 'free' | 'premium' | 'elite';
    createdAt: string;
    profile?: {
      hasCompletedOnboarding?: boolean;
      spiritualInterests?: string[];
    };
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export class AuthRepository implements IAuthRepository {
  private readonly baseURL: string;
  private readonly TOKEN_KEY = 'stellara_tokens';

  constructor(baseURL: string = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1') {
    this.baseURL = baseURL;
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${this.baseURL}/auth/login`,
        credentials
      );

      const { user: userDto, tokens } = response.data;
      
      const user = new User({
        id: userDto.id,
        email: userDto.email,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        subscriptionTier: userDto.subscriptionTier,
        createdAt: new Date(userDto.createdAt),
        profile: userDto.profile,
      });

      return { user, tokens };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid credentials');
      }
      throw new Error('Network error');
    }
  }

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const response: AxiosResponse<LoginResponse> = await axios.post(
        `${this.baseURL}/auth/register`,
        data
      );

      const { user: userDto, tokens } = response.data;
      
      const user = new User({
        id: userDto.id,
        email: userDto.email,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        subscriptionTier: userDto.subscriptionTier,
        createdAt: new Date(userDto.createdAt),
        profile: userDto.profile,
      });

      return { user, tokens };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          throw new Error('User already exists');
        }
        if (error.response?.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
      }
      throw new Error('Registration failed');
    }
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });

      return { accessToken: response.data.accessToken };
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  async logout(): Promise<void> {
    await this.clearTokens();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens) {
        return null;
      }

      const response = await axios.get(`${this.baseURL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });

      const userDto = response.data.user;
      return new User({
        id: userDto.id,
        email: userDto.email,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        subscriptionTier: userDto.subscriptionTier,
        createdAt: new Date(userDto.createdAt),
        profile: userDto.profile,
      });
    } catch (error) {
      await this.clearTokens();
      return null;
    }
  }

  async storeTokens(tokens: AuthTokens): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.TOKEN_KEY, JSON.stringify(tokens));
    } catch (error) {
      throw new Error('Failed to store tokens');
    }
  }

  async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const stored = await SecureStore.getItemAsync(this.TOKEN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.TOKEN_KEY);
    } catch (error) {
      // Ignore errors when clearing tokens
    }
  }
}