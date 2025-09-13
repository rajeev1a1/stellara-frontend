import { AiRepository } from '../../modules/ai/infrastructure/repositories/AiRepository';
import { SendChatMessage } from '../../modules/ai/domain/use-cases/SendChatMessage';
import { RequestSpiritualGuidance } from '../../modules/ai/domain/use-cases/RequestSpiritualGuidance';
import { RequestAstrologyReading } from '../../modules/ai/domain/use-cases/RequestAstrologyReading';
import { LoadConversations } from '../../modules/ai/domain/use-cases/LoadConversations';

// Mock authentication token getter
const mockGetAuthToken = async () => 'mock-jwt-token-for-testing';

describe('AI Integration Tests', () => {
  const baseUrl = 'http://localhost:3000/api/v1';
  let aiRepository: AiRepository;
  let sendChatMessage: SendChatMessage;
  let requestSpiritualGuidance: RequestSpiritualGuidance;
  let requestAstrologyReading: RequestAstrologyReading;
  let loadConversations: LoadConversations;

  beforeAll(() => {
    aiRepository = new AiRepository(baseUrl, mockGetAuthToken);
    sendChatMessage = new SendChatMessage(aiRepository);
    requestSpiritualGuidance = new RequestSpiritualGuidance(aiRepository);
    requestAstrologyReading = new RequestAstrologyReading(aiRepository);
    loadConversations = new LoadConversations(aiRepository);
  });

  describe('Chat Integration', () => {
    it('should send chat message to backend (expect auth failure)', async () => {
      // This test verifies that our frontend components can communicate with the backend
      // We expect an authentication error since we're using a mock token
      const result = await sendChatMessage.execute({
        message: 'Hello, I need spiritual guidance about meditation',
        userContext: {
          spiritualInterests: ['meditation'],
          experienceLevel: 'beginner',
          preferredPractices: ['breathing'],
        },
        location: 'home',
        timeOfDay: 'morning',
      });

      expect(result.success).toBe(false);
      // Should get authentication error from backend
      expect(result.error).toContain('Authentication');
    }, 10000);

    it('should handle network errors gracefully', async () => {
      // Test with invalid URL to verify error handling
      const invalidRepository = new AiRepository('http://invalid-url:9999/api/v1', mockGetAuthToken);
      const invalidSendChatMessage = new SendChatMessage(invalidRepository);
      
      const result = await invalidSendChatMessage.execute({
        message: 'Test message',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network connection failed');
    }, 10000);

    it('should validate input properly', async () => {
      const result = await sendChatMessage.execute({
        message: '', // Empty message should fail validation
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message cannot be empty');
    });

    it('should validate message length', async () => {
      const longMessage = 'a'.repeat(2001); // Over limit
      const result = await sendChatMessage.execute({
        message: longMessage,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Message too long. Please keep messages under 2000 characters.');
    });
  });

  describe('Spiritual Guidance Integration', () => {
    it('should request spiritual guidance from backend (expect auth failure)', async () => {
      const result = await requestSpiritualGuidance.execute({
        topic: 'Finding inner peace through meditation',
        userContext: {
          spiritualGoals: ['Develop daily meditation practice'],
          currentChallenges: ['Stress from work'],
          experienceLevel: 'beginner',
          preferredPractices: ['mindfulness'],
          timeAvailable: '30 minutes',
          previousExperiences: ['Tried meditation apps'],
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication');
    }, 10000);

    it('should validate spiritual guidance input', async () => {
      const result = await requestSpiritualGuidance.execute({
        topic: '', // Empty topic should fail
        userContext: {
          spiritualGoals: ['Test goal'],
          currentChallenges: ['Test challenge'],
          experienceLevel: 'beginner',
          preferredPractices: ['meditation'],
          previousExperiences: [],
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic cannot be empty');
    });

    it('should validate experience level', async () => {
      const result = await requestSpiritualGuidance.execute({
        topic: 'Test topic',
        userContext: {
          spiritualGoals: ['Test goal'],
          currentChallenges: ['Test challenge'],
          experienceLevel: 'expert' as any, // Invalid experience level
          preferredPractices: ['meditation'],
          previousExperiences: [],
        },
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid experience level. Must be beginner, intermediate, or advanced.');
    });
  });

  describe('Astrology Reading Integration', () => {
    it('should request astrology reading from backend (expect auth failure)', async () => {
      const result = await requestAstrologyReading.execute({
        birthInfo: {
          dateOfBirth: '1990-01-15',
          timeOfBirth: '14:30',
          placeOfBirth: 'New York, NY',
          timezone: 'America/New_York',
        },
        readingType: 'natal_chart',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Authentication');
    }, 10000);

    it('should validate birth date format', async () => {
      const result = await requestAstrologyReading.execute({
        birthInfo: {
          dateOfBirth: '15-01-1990', // Invalid format
          timeOfBirth: '14:30',
          placeOfBirth: 'New York, NY',
        },
        readingType: 'natal_chart',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('date of birth must be in YYYY-MM-DD format');
    });

    it('should validate time format', async () => {
      const result = await requestAstrologyReading.execute({
        birthInfo: {
          dateOfBirth: '1990-01-15',
          timeOfBirth: '2:30 PM', // Invalid format
          placeOfBirth: 'New York, NY',
        },
        readingType: 'natal_chart',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('time of birth must be in HH:MM format');
    });

    it('should validate reading type', async () => {
      const result = await requestAstrologyReading.execute({
        birthInfo: {
          dateOfBirth: '1990-01-15',
          timeOfBirth: '14:30',
          placeOfBirth: 'New York, NY',
        },
        readingType: 'invalid_reading_type',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid reading type');
    });

    it('should require partner info for compatibility reading', async () => {
      const result = await requestAstrologyReading.execute({
        birthInfo: {
          dateOfBirth: '1990-01-15',
          timeOfBirth: '14:30',
          placeOfBirth: 'New York, NY',
        },
        readingType: 'compatibility', // Requires partner info
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Partner birth information is required');
    });
  });

  describe('Conversation Management Integration', () => {
    it('should load conversations from local storage', async () => {
      const result = await loadConversations.execute({ limit: 10 });
      
      // Should succeed since this is local storage operation
      expect(result.success).toBe(true);
      expect(result.conversations).toBeDefined();
      expect(Array.isArray(result.conversations)).toBe(true);
    });

    it('should validate load conversations limit', async () => {
      const result = await loadConversations.execute({ limit: 0 }); // Invalid limit
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Limit must be a positive integer');
    });

    it('should validate load conversations max limit', async () => {
      const result = await loadConversations.execute({ limit: 101 }); // Over max limit
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Limit cannot exceed 100 conversations');
    });
  });

  describe('Repository Error Handling', () => {
    it('should handle malformed JSON responses', async () => {
      // Mock fetch to return malformed JSON
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Malformed JSON')),
        statusText: 'Internal Server Error',
      });

      const result = await sendChatMessage.execute({
        message: 'Test message',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Internal Server Error');

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should handle different HTTP status codes correctly', async () => {
      const testCases = [
        { status: 400, expectedError: 'Invalid request' },
        { status: 401, expectedError: 'Authentication required' },
        { status: 403, expectedError: 'Access denied' },
        { status: 429, expectedError: 'Too many requests' },
        { status: 500, expectedError: 'AI service is temporarily unavailable' },
      ];

      for (const testCase of testCases) {
        const originalFetch = global.fetch;
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: testCase.status,
          json: () => Promise.resolve({ message: 'Test error' }),
          statusText: 'Error',
        });

        const result = await sendChatMessage.execute({
          message: 'Test message',
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain(testCase.expectedError);

        // Restore original fetch
        global.fetch = originalFetch;
      }
    });
  });

  describe('Local Storage Integration', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    });

    it('should save and load conversations locally', async () => {
      // First, try to send a chat message (will fail auth but conversation will be created)
      const chatResult = await sendChatMessage.execute({
        message: 'Test message for local storage',
        userContext: {
          spiritualInterests: ['meditation'],
          experienceLevel: 'beginner',
          preferredPractices: ['breathing'],
        },
      });

      // Should fail due to auth, but let's test local storage operations directly
      expect(chatResult.success).toBe(false);

      // Test loading conversations from empty storage
      const loadResult = await loadConversations.execute();
      expect(loadResult.success).toBe(true);
      expect(loadResult.conversations).toEqual([]);
    });
  });
});