import { User } from '../User';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a user with required properties', () => {
      // Arrange
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free' as const,
        createdAt: new Date(),
      };

      // Act
      const user = new User(userData);

      // Assert
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.subscriptionTier).toBe('free');
      expect(user.createdAt).toEqual(userData.createdAt);
    });

    it('should create a user with optional profile', () => {
      // Arrange
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'premium' as const,
        createdAt: new Date(),
        profile: {
          hasCompletedOnboarding: true,
          spiritualInterests: ['meditation', 'chakras'],
        },
      };

      // Act
      const user = new User(userData);

      // Assert
      expect(user.profile).toEqual({
        hasCompletedOnboarding: true,
        spiritualInterests: ['meditation', 'chakras'],
      });
    });
  });

  describe('getters', () => {
    it('should return full name', () => {
      // Arrange
      const user = new User({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free',
        createdAt: new Date(),
      });

      // Act
      const fullName = user.fullName;

      // Assert
      expect(fullName).toBe('John Doe');
    });

    it('should return initials', () => {
      // Arrange
      const user = new User({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free',
        createdAt: new Date(),
      });

      // Act
      const initials = user.initials;

      // Assert
      expect(initials).toBe('JD');
    });

    it('should handle single name for initials', () => {
      // Arrange
      const user = new User({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: '',
        subscriptionTier: 'free',
        createdAt: new Date(),
      });

      // Act
      const initials = user.initials;

      // Assert
      expect(initials).toBe('J');
    });
  });

  describe('methods', () => {
    it('should check if user has premium subscription', () => {
      // Arrange
      const freeUser = new User({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free',
        createdAt: new Date(),
      });

      const premiumUser = new User({
        id: 'user-456',
        email: 'premium@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        subscriptionTier: 'premium',
        createdAt: new Date(),
      });

      // Act & Assert
      expect(freeUser.isPremium()).toBe(false);
      expect(premiumUser.isPremium()).toBe(true);
    });

    it('should check if onboarding is completed', () => {
      // Arrange
      const userWithoutProfile = new User({
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free',
        createdAt: new Date(),
      });

      const userWithCompletedOnboarding = new User({
        id: 'user-456',
        email: 'onboarded@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        subscriptionTier: 'free',
        createdAt: new Date(),
        profile: {
          hasCompletedOnboarding: true,
          spiritualInterests: ['meditation'],
        },
      });

      const userWithIncompleteOnboarding = new User({
        id: 'user-789',
        email: 'incomplete@example.com',
        firstName: 'Bob',
        lastName: 'Wilson',
        subscriptionTier: 'free',
        createdAt: new Date(),
        profile: {
          hasCompletedOnboarding: false,
          spiritualInterests: [],
        },
      });

      // Act & Assert
      expect(userWithoutProfile.hasCompletedOnboarding()).toBe(false);
      expect(userWithCompletedOnboarding.hasCompletedOnboarding()).toBe(true);
      expect(userWithIncompleteOnboarding.hasCompletedOnboarding()).toBe(false);
    });
  });

  describe('validation', () => {
    it('should throw error for invalid email format', () => {
      // Arrange
      const invalidUserData = {
        id: 'user-123',
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'free' as const,
        createdAt: new Date(),
      };

      // Act & Assert
      expect(() => new User(invalidUserData)).toThrow('Invalid email format');
    });

    it('should throw error for empty first name', () => {
      // Arrange
      const invalidUserData = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: '',
        lastName: 'Doe',
        subscriptionTier: 'free' as const,
        createdAt: new Date(),
      };

      // Act & Assert
      expect(() => new User(invalidUserData)).toThrow('First name is required');
    });

    it('should throw error for invalid subscription tier', () => {
      // Arrange
      const invalidUserData = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        subscriptionTier: 'invalid' as any,
        createdAt: new Date(),
      };

      // Act & Assert
      expect(() => new User(invalidUserData)).toThrow('Invalid subscription tier');
    });
  });
});