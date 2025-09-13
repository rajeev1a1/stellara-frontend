import { LoginUser } from '../LoginUser';
import { IAuthRepository, LoginCredentials, AuthResult } from '../../repositories/IAuthRepository';
import { User } from '../../entities/User';

// Mock implementation of AuthRepository
class MockAuthRepository implements IAuthRepository {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    if (credentials.email === 'test@example.com' && credentials.password === 'Password123!') {
      const user = new User({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free',
        createdAt: new Date(),
      });

      return {
        user,
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      };
    }
    throw new Error('Invalid credentials');
  }

  // Other methods for interface compliance
  async register(): Promise<AuthResult> { throw new Error('Not implemented'); }
  async refresh(): Promise<{ accessToken: string }> { throw new Error('Not implemented'); }
  async logout(): Promise<void> { throw new Error('Not implemented'); }
  async getCurrentUser(): Promise<User | null> { throw new Error('Not implemented'); }
  async storeTokens(): Promise<void> { /* Mock implementation - no-op */ }
  async getStoredTokens(): Promise<any> { throw new Error('Not implemented'); }
  async clearTokens(): Promise<void> { throw new Error('Not implemented'); }
}

describe('LoginUser Use Case', () => {
  let loginUser: LoginUser;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    loginUser = new LoginUser(mockRepository);
  });

  describe('execute', () => {
    it('should login user with valid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Act
      const result = await loginUser.execute(credentials);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.user?.email).toBe('test@example.com');
      expect(result.tokens?.accessToken).toBe('mock-access-token');
      expect(result.tokens?.refreshToken).toBe('mock-refresh-token');
      expect(result.error).toBeUndefined();
    });

    it('should fail with invalid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'wrong@example.com',
        password: 'WrongPass123!', // Valid format but wrong credentials
      };

      // Act
      const result = await loginUser.execute(credentials);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should validate email format', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      // Act
      const result = await loginUser.execute(credentials);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid email format');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should validate password length', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: '123', // Too short
      };

      // Act
      const result = await loginUser.execute(credentials);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const mockFailRepository = {
        ...mockRepository,
        login: jest.fn().mockRejectedValue(new Error('Network error')),
      } as unknown as IAuthRepository;

      const loginUserWithFailRepo = new LoginUser(mockFailRepository);
      
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Act
      const result = await loginUserWithFailRepo.execute(credentials);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Login failed. Please try again.');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should store tokens on successful login', async () => {
      // Arrange
      const mockStoreTokens = jest.fn().mockResolvedValue(undefined);
      const mockRepositoryWithStore: IAuthRepository = {
        login: mockRepository.login.bind(mockRepository),
        register: mockRepository.register.bind(mockRepository),
        refresh: mockRepository.refresh.bind(mockRepository),
        logout: mockRepository.logout.bind(mockRepository),
        getCurrentUser: mockRepository.getCurrentUser.bind(mockRepository),
        storeTokens: mockStoreTokens,
        getStoredTokens: mockRepository.getStoredTokens.bind(mockRepository),
        clearTokens: mockRepository.clearTokens.bind(mockRepository),
      };

      const loginUserWithStore = new LoginUser(mockRepositoryWithStore);
      
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      // Act
      const result = await loginUserWithStore.execute(credentials);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStoreTokens).toHaveBeenCalledWith({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
    });
  });
});