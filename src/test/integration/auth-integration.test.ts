import { AuthRepository } from '../../modules/auth/infrastructure/repositories/AuthRepository';
import { LoginUser } from '../../modules/auth/domain/use-cases/LoginUser';
import { RegisterUser } from '../../modules/auth/domain/use-cases/RegisterUser';

// Integration tests that test the actual frontend -> backend integration
describe('Auth Integration Tests', () => {
  let authRepository: AuthRepository;
  let loginUser: LoginUser;
  let registerUser: RegisterUser;
  
  // Generate unique email per test run to avoid conflicts
  const testEmail = `test-${Date.now()}-${Math.random().toString(36).substring(2)}@stellara.com`;
  const validPassword = 'TestPass123#';

  beforeAll(() => {
    // Use the actual repository that calls the real backend
    authRepository = new AuthRepository('http://localhost:3000/api/v1');
    loginUser = new LoginUser(authRepository);
    registerUser = new RegisterUser(authRepository);
  });

  describe('Register Integration', () => {
    it('should register a user through the full stack', async () => {
      const result = await registerUser.execute({
        email: testEmail,
        password: validPassword,
        firstName: 'Integration',
        lastName: 'Test',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.user?.email).toBe(testEmail);
      expect(result.user?.firstName).toBe('Integration');
      expect(result.user?.lastName).toBe('Test');
      expect(result.tokens?.accessToken).toBeDefined();
      expect(result.tokens?.refreshToken).toBeDefined();
      expect(result.error).toBeUndefined();
    }, 10000); // 10 second timeout for network call

    it('should fail to register with weak password', async () => {
      const result = await registerUser.execute({
        email: `test2-${Date.now()}-${Math.random().toString(36).substring(2)}@stellara.com`,
        password: 'weakpass', // Missing uppercase and special char
        firstName: 'Integration',
        lastName: 'Test',
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Password must contain at least one uppercase letter');
    });

    it('should fail to register duplicate email', async () => {
      // First register a user
      const duplicateEmail = `duplicate-${Date.now()}-${Math.random().toString(36).substring(2)}@stellara.com`;
      await registerUser.execute({
        email: duplicateEmail,
        password: validPassword,
        firstName: 'First',
        lastName: 'User',
      });

      // Wait a moment to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Try to register again with same email
      const result = await registerUser.execute({
        email: duplicateEmail, // Same email as first registration
        password: validPassword,
        firstName: 'Duplicate',
        lastName: 'Test',
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toContain('already exists'); // Backend may return different message
    }, 15000);
  });

  describe('Login Integration', () => {
    it('should login with registered credentials', async () => {
      const result = await loginUser.execute({
        email: testEmail,
        password: validPassword,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.user?.email).toBe(testEmail);
      expect(result.tokens?.accessToken).toBeDefined();
      expect(result.tokens?.refreshToken).toBeDefined();
      expect(result.error).toBeUndefined();
    }, 10000);

    it('should fail login with wrong password', async () => {
      const result = await loginUser.execute({
        email: testEmail,
        password: 'WrongPass123#',
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    }, 10000);

    it('should fail login with non-existent email', async () => {
      const result = await loginUser.execute({
        email: 'nonexistent@stellara.com',
        password: validPassword,
      });

      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    }, 10000);
  });
});