import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthRepository } from '../AuthRepository';
import { LoginCredentials, RegisterData } from '../../../domain/repositories/IAuthRepository';

// Mock dependencies
jest.mock('axios');
jest.mock('expo-secure-store');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  const baseURL = 'http://localhost:3000/api';

  beforeEach(() => {
    authRepository = new AuthRepository(baseURL);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            subscriptionTier: 'free',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
          tokens: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authRepository.login(credentials);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${baseURL}/auth/login`,
        credentials
      );
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBe('access-token');
    });

    it('should throw "Invalid credentials" error for 401 response', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: { status: 401 },
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      // Act & Assert
      await expect(authRepository.login(credentials)).rejects.toThrow('Invalid credentials');
    });

    it('should throw "Network error" for other errors', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockedAxios.post.mockRejectedValue(new Error('Network failure'));
      mockedAxios.isAxiosError.mockReturnValue(false);

      // Act & Assert
      await expect(authRepository.login(credentials)).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('should register successfully with valid data', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const mockResponse = {
        data: {
          user: {
            id: 'user-456',
            email: 'newuser@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
            subscriptionTier: 'free',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
          tokens: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
          },
        },
      };

      mockedAxios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await authRepository.register(registerData);

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${baseURL}/auth/register`,
        registerData
      );
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.firstName).toBe('Jane');
    });

    it('should throw "User already exists" error for 409 response', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      mockedAxios.post.mockRejectedValue({
        isAxiosError: true,
        response: { status: 409 },
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      // Act & Assert
      await expect(authRepository.register(registerData)).rejects.toThrow('User already exists');
    });
  });

  describe('storeTokens', () => {
    it('should store tokens securely', async () => {
      // Arrange
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockedSecureStore.setItemAsync.mockResolvedValue();

      // Act
      await authRepository.storeTokens(tokens);

      // Assert
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        'stellara_tokens',
        JSON.stringify(tokens)
      );
    });

    it('should throw error if storage fails', async () => {
      // Arrange
      const tokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockedSecureStore.setItemAsync.mockRejectedValue(new Error('Storage failed'));

      // Act & Assert
      await expect(authRepository.storeTokens(tokens)).rejects.toThrow('Failed to store tokens');
    });
  });

  describe('getStoredTokens', () => {
    it('should retrieve stored tokens', async () => {
      // Arrange
      const storedTokens = {
        accessToken: 'stored-access-token',
        refreshToken: 'stored-refresh-token',
      };

      mockedSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(storedTokens));

      // Act
      const result = await authRepository.getStoredTokens();

      // Assert
      expect(result).toEqual(storedTokens);
      expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith('stellara_tokens');
    });

    it('should return null if no tokens stored', async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      // Act
      const result = await authRepository.getStoredTokens();

      // Assert
      expect(result).toBeNull();
    });

    it('should return null if retrieval fails', async () => {
      // Arrange
      mockedSecureStore.getItemAsync.mockRejectedValue(new Error('Retrieval failed'));

      // Act
      const result = await authRepository.getStoredTokens();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should clear stored tokens', async () => {
      // Arrange
      mockedSecureStore.deleteItemAsync.mockResolvedValue();

      // Act
      await authRepository.clearTokens();

      // Assert
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('stellara_tokens');
    });

    it('should not throw error if clearing fails', async () => {
      // Arrange
      mockedSecureStore.deleteItemAsync.mockRejectedValue(new Error('Delete failed'));

      // Act & Assert
      await expect(authRepository.clearTokens()).resolves.not.toThrow();
    });
  });
});