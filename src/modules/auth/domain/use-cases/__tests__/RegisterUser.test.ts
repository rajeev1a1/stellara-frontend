import { RegisterUser } from '../RegisterUser';
import { IAuthRepository, RegisterData, AuthResult } from '../../repositories/IAuthRepository';
import { User } from '../../entities/User';

// Mock implementation of AuthRepository
class MockAuthRepository implements IAuthRepository {
  async register(data: RegisterData): Promise<AuthResult> {
    if (data.email === 'newuser@example.com' && data.password === 'Password123!') {
      const user = new User({
        id: 'user-456',
        email: 'newuser@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        subscriptionTier: 'free',
        createdAt: new Date(),
      });

      return {
        user,
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      };
    }
    
    if (data.email === 'existing@example.com') {
      throw new Error('User already exists');
    }
    
    throw new Error('Registration failed');
  }

  // Other methods for interface compliance
  async login(): Promise<AuthResult> { throw new Error('Not implemented'); }
  async refresh(): Promise<{ accessToken: string }> { throw new Error('Not implemented'); }
  async logout(): Promise<void> { throw new Error('Not implemented'); }
  async getCurrentUser(): Promise<User | null> { throw new Error('Not implemented'); }
  async storeTokens(): Promise<void> { /* Mock implementation - no-op */ }
  async getStoredTokens(): Promise<any> { throw new Error('Not implemented'); }
  async clearTokens(): Promise<void> { throw new Error('Not implemented'); }
}

describe('RegisterUser Use Case', () => {
  let registerUser: RegisterUser;
  let mockRepository: MockAuthRepository;

  beforeEach(() => {
    mockRepository = new MockAuthRepository();
    registerUser = new RegisterUser(mockRepository);
  });

  describe('execute', () => {
    it('should register user with valid data', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Act
      const result = await registerUser.execute(registerData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(result.user?.email).toBe('newuser@example.com');
      expect(result.user?.firstName).toBe('Jane');
      expect(result.tokens?.accessToken).toBe('new-access-token');
      expect(result.tokens?.refreshToken).toBe('new-refresh-token');
      expect(result.error).toBeUndefined();
    });

    it('should fail with invalid email format', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Act
      const result = await registerUser.execute(registerData);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid email format');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should fail with short password', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: '123', // Too short
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Act
      const result = await registerUser.execute(registerData);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should fail with empty first name', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: '',
        lastName: 'Doe',
      };

      // Act
      const result = await registerUser.execute(registerData);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('First name is required');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should fail with empty last name', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: '',
      };

      // Act
      const result = await registerUser.execute(registerData);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Last name is required');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should fail when user already exists', async () => {
      // Arrange
      const registerData: RegisterData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Act
      const result = await registerUser.execute(registerData);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('User already exists');
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const mockFailRepository = {
        ...mockRepository,
        register: jest.fn().mockRejectedValue(new Error('Network error')),
      } as unknown as IAuthRepository;

      const registerUserWithFailRepo = new RegisterUser(mockFailRepository);
      
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Act
      const result = await registerUserWithFailRepo.execute(registerData);

      // Assert
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Network error'); // Now returns the actual error message
      expect(result.user).toBeUndefined();
      expect(result.tokens).toBeUndefined();
    });

    it('should store tokens on successful registration', async () => {
      // Arrange
      const mockStoreTokens = jest.fn().mockResolvedValue(undefined);
      const mockRepositoryWithStore: IAuthRepository = {
        register: mockRepository.register.bind(mockRepository),
        login: mockRepository.login.bind(mockRepository),
        refresh: mockRepository.refresh.bind(mockRepository),
        logout: mockRepository.logout.bind(mockRepository),
        getCurrentUser: mockRepository.getCurrentUser.bind(mockRepository),
        storeTokens: mockStoreTokens,
        getStoredTokens: mockRepository.getStoredTokens.bind(mockRepository),
        clearTokens: mockRepository.clearTokens.bind(mockRepository),
      };

      const registerUserWithStore = new RegisterUser(mockRepositoryWithStore);
      
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Act
      const result = await registerUserWithStore.execute(registerData);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockStoreTokens).toHaveBeenCalledWith({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });
  });
});