import { SendChatMessage, SendChatMessageRequest } from '../SendChatMessage';
import { IAiRepository, ChatRequest, ChatResponse } from '../../repositories/IAiRepository';
import { Message } from '../../entities/Message';
import { Conversation } from '../../entities/Conversation';

// Mock implementation of IAiRepository for testing
class MockAiRepository implements IAiRepository {
  // Mock methods - will be spied on in tests
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return {
      message: 'Mocked AI response',
      conversationId: request.conversationId || 'conv-123',
      spiritualThemes: ['inner_peace'],
      suggestedActions: ['Try meditation'],
      relatedTopics: ['mindfulness'],
      timestamp: new Date(),
    };
  }

  async requestSpiritualGuidance(): Promise<any> {
    throw new Error('Not implemented in mock');
  }

  async requestAstrologyReading(): Promise<any> {
    throw new Error('Not implemented in mock');
  }

  async getConversationHistory(): Promise<any> {
    throw new Error('Not implemented in mock');
  }

  async saveConversation(): Promise<void> {
    // Mock implementation - no-op
  }

  async loadConversation(): Promise<Conversation | null> {
    return null;
  }

  async loadConversations(): Promise<Conversation[]> {
    return [];
  }

  async deleteConversation(): Promise<void> {
    // Mock implementation - no-op
  }
}

describe('SendChatMessage Use Case', () => {
  let sendChatMessage: SendChatMessage;
  let mockRepository: MockAiRepository;

  const validRequest: SendChatMessageRequest = {
      message: 'How can I find inner peace?',
      userContext: {
        spiritualInterests: ['meditation'],
        experienceLevel: 'beginner',
        preferredPractices: ['breathing'],
      },
      location: 'home',
      timeOfDay: 'morning',
    };

  beforeEach(() => {
    mockRepository = new MockAiRepository();
    sendChatMessage = new SendChatMessage(mockRepository);
  });

  describe('execute', () => {
    it('should send chat message successfully without existing conversation', async () => {
      // Arrange
      const sendChatMessageSpy = jest.spyOn(mockRepository, 'sendChatMessage');
      const saveConversationSpy = jest.spyOn(mockRepository, 'saveConversation').mockResolvedValue();

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedConversation).toBeDefined();
      expect(result.assistantMessage).toBeDefined();
      expect(result.error).toBeUndefined();

      // Should create new conversation with 2 messages (user + assistant)
      expect(result.updatedConversation!.getMessageCount()).toBe(2);
      expect(result.updatedConversation!.hasUserStarted()).toBe(true);

      // Should call repository methods
      expect(sendChatMessageSpy).toHaveBeenCalledWith({
        message: validRequest.message,
        conversationId: result.updatedConversation!.id,
        context: {
          userProfile: validRequest.userContext,
          location: validRequest.location,
          timeOfDay: validRequest.timeOfDay,
        },
      });
      expect(saveConversationSpy).toHaveBeenCalledWith(result.updatedConversation);
    });

    it('should send chat message successfully with existing conversation', async () => {
      // Arrange
      const existingMessage = Message.createUserMessage('Previous message');
      const existingConversation = Conversation.createWithFirstMessage(existingMessage);
      
      const requestWithConversation = {
        ...validRequest,
        conversation: existingConversation,
      };

      const sendChatMessageSpy = jest.spyOn(mockRepository, 'sendChatMessage');
      const saveConversationSpy = jest.spyOn(mockRepository, 'saveConversation').mockResolvedValue();

      // Act
      const result = await sendChatMessage.execute(requestWithConversation);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedConversation).toBeDefined();
      
      // Should have 3 messages now: previous + new user + assistant
      expect(result.updatedConversation!.getMessageCount()).toBe(3);
      expect(result.updatedConversation!.id).toBe(existingConversation.id);

      // Should use existing conversation ID
      expect(sendChatMessageSpy).toHaveBeenCalledWith({
        message: validRequest.message,
        conversationId: existingConversation.id,
        context: {
          userProfile: validRequest.userContext,
          location: validRequest.location,
          timeOfDay: validRequest.timeOfDay,
        },
      });
      expect(saveConversationSpy).toHaveBeenCalled();
    });

    it('should create assistant message with correct properties', async () => {
      // Arrange - need to use a spy to get the actual conversation ID that will be generated
      let actualConversationId: string = '';
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockImplementation(async (request: ChatRequest) => {
          actualConversationId = request.conversationId!;
          return {
            message: 'Find peace through meditation and mindfulness.',
            conversationId: actualConversationId,
            spiritualThemes: ['meditation', 'mindfulness'],
            suggestedActions: ['Practice daily meditation', 'Try breathing exercises'],
            relatedTopics: ['inner_peace', 'stress_relief'],
            timestamp: new Date('2023-01-01T12:00:00Z'),
          };
        });
      jest.spyOn(mockRepository, 'saveConversation').mockResolvedValue();

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.assistantMessage).toBeDefined();

      const assistantMessage = result.assistantMessage!;
      expect(assistantMessage.role).toBe('assistant');
      expect(assistantMessage.content).toBe('Find peace through meditation and mindfulness.');
      expect(assistantMessage.spiritualThemes).toEqual(['meditation', 'mindfulness']);
      expect(assistantMessage.suggestedActions).toEqual(['Practice daily meditation', 'Try breathing exercises']);
      expect(assistantMessage.relatedTopics).toEqual(['inner_peace', 'stress_relief']);
      expect(assistantMessage.conversationId).toBe(actualConversationId);
    });
  });

  describe('input validation', () => {
    it('should fail with empty message', async () => {
      // Arrange
      const invalidRequest = { ...validRequest, message: '' };

      // Act
      const result = await sendChatMessage.execute(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Message cannot be empty');
      expect(result.updatedConversation).toBeUndefined();
    });

    it('should fail with whitespace-only message', async () => {
      // Arrange
      const invalidRequest = { ...validRequest, message: '   ' };

      // Act
      const result = await sendChatMessage.execute(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Message cannot be empty');
    });

    it('should fail with message too long', async () => {
      // Arrange
      const longMessage = 'a'.repeat(2001);
      const invalidRequest = { ...validRequest, message: longMessage };

      // Act
      const result = await sendChatMessage.execute(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Message too long. Please keep messages under 2000 characters.');
    });

    it('should fail with invalid experience level', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        userContext: {
          experienceLevel: 'expert' as any, // Invalid level
        },
      };

      // Act
      const result = await sendChatMessage.execute(invalidRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid experience level. Must be beginner, intermediate, or advanced.');
    });
  });

  describe('error handling', () => {
    it('should handle authentication error', async () => {
      // Arrange
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockRejectedValue(new Error('Authentication required'));

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required. Please log in.');
    });

    it('should handle message too long error from backend', async () => {
      // Arrange
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockRejectedValue(new Error('Message too long'));

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Message too long. Please keep messages under 2000 characters.');
    });

    it('should handle service unavailable error', async () => {
      // Arrange
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockRejectedValue(new Error('AI service temporarily unavailable'));

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('AI service is temporarily unavailable. Please try again later.');
    });

    it('should handle content policy error', async () => {
      // Arrange
      const policyError = new Error('I can only provide guidance on spiritual and wellness topics.');
      jest.spyOn(mockRepository, 'sendChatMessage').mockRejectedValue(policyError);

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('I can only provide guidance on spiritual and wellness topics.');
    });

    it('should handle invalid request data error', async () => {
      // Arrange
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockRejectedValue(new Error('Invalid request data'));

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid request. Please check your input and try again.');
    });

    it('should handle generic errors', async () => {
      // Arrange
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockRejectedValue(new Error('Network connection failed'));

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network connection failed');
    });

    it('should handle non-Error exceptions', async () => {
      // Arrange
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockRejectedValue('Unexpected error');

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle save conversation failure gracefully', async () => {
      // Arrange - need to use the actual conversation ID that gets generated
      let actualConversationId: string = '';
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockImplementation(async (request: ChatRequest) => {
          actualConversationId = request.conversationId!;
          return {
            message: 'AI response',
            conversationId: actualConversationId,
            spiritualThemes: [],
            timestamp: new Date(),
          };
        });
      jest.spyOn(mockRepository, 'saveConversation')
        .mockRejectedValue(new Error('Storage failed'));

      // Act
      const result = await sendChatMessage.execute(validRequest);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage failed');
    });
  });

  describe('edge cases', () => {
    it('should handle minimal valid request', async () => {
      // Arrange
      const minimalRequest: SendChatMessageRequest = {
        message: 'Hi',
      };

      // Use implementation that returns the actual conversation ID
      let actualConversationId: string = '';
      jest.spyOn(mockRepository, 'sendChatMessage')
        .mockImplementation(async (request: ChatRequest) => {
          actualConversationId = request.conversationId!;
          return {
            message: 'Hello! How can I help you today?',
            conversationId: actualConversationId,
            spiritualThemes: ['welcome'],
            timestamp: new Date(),
          };
        });
      jest.spyOn(mockRepository, 'saveConversation').mockResolvedValue();

      // Act
      const result = await sendChatMessage.execute(minimalRequest);

      // Assert
      expect(result.success).toBe(true);
      expect(result.updatedConversation).toBeDefined();
      expect(result.assistantMessage).toBeDefined();
    });

    it('should trim message content', async () => {
      // Arrange
      const requestWithSpaces = {
        ...validRequest,
        message: '  How can I meditate?  ',
      };

      const sendChatMessageSpy = jest.spyOn(mockRepository, 'sendChatMessage');
      jest.spyOn(mockRepository, 'saveConversation').mockResolvedValue();

      // Act
      const result = await sendChatMessage.execute(requestWithSpaces);

      // Assert
      expect(result.success).toBe(true);
      
      // Should trim the message in the request to backend
      expect(sendChatMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '  How can I meditate?  ', // Original message passed through
        })
      );
      
      // But user message should be trimmed
      const userMessage = result.updatedConversation!.messages[0];
      expect(userMessage).toBeDefined();
      expect(userMessage!.content).toBe('How can I meditate?');
    });
  });
});