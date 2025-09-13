import { Message, MessageProps } from '../Message';

describe('Message Entity', () => {
  const validMessageProps: MessageProps = {
    id: 'test-message-1',
    role: 'user',
    content: 'Hello, how can I find inner peace?',
    timestamp: new Date('2023-01-01T12:00:00Z'),
    conversationId: 'conv-1',
    spiritualThemes: ['inner_peace', 'meditation'],
    suggestedActions: ['Try breathing meditation'],
    relatedTopics: ['mindfulness', 'stress_relief'],
  };

  describe('constructor', () => {
    it('should create a message with valid properties', () => {
      const message = new Message(validMessageProps);

      expect(message.id).toBe(validMessageProps.id);
      expect(message.role).toBe(validMessageProps.role);
      expect(message.content).toBe(validMessageProps.content);
      expect(message.timestamp).toEqual(validMessageProps.timestamp);
      expect(message.conversationId).toBe(validMessageProps.conversationId);
      expect(message.spiritualThemes).toEqual(validMessageProps.spiritualThemes);
      expect(message.suggestedActions).toEqual(validMessageProps.suggestedActions);
      expect(message.relatedTopics).toEqual(validMessageProps.relatedTopics);
    });

    it('should create a message without optional properties', () => {
      const minimalProps: MessageProps = {
        id: 'test-message-2',
        role: 'assistant',
        content: 'Finding inner peace starts with mindfulness.',
        timestamp: new Date(),
      };

      const message = new Message(minimalProps);

      expect(message.id).toBe(minimalProps.id);
      expect(message.spiritualThemes).toEqual([]);
      expect(message.suggestedActions).toEqual([]);
      expect(message.relatedTopics).toEqual([]);
      expect(message.conversationId).toBeUndefined();
    });

    it('should throw error for empty ID', () => {
      const invalidProps = { ...validMessageProps, id: '' };
      expect(() => new Message(invalidProps)).toThrow('Message ID is required');
    });

    it('should throw error for empty content', () => {
      const invalidProps = { ...validMessageProps, content: '' };
      expect(() => new Message(invalidProps)).toThrow('Message content cannot be empty');
    });

    it('should throw error for content too long', () => {
      const longContent = 'a'.repeat(2001);
      const invalidProps = { ...validMessageProps, content: longContent };
      expect(() => new Message(invalidProps)).toThrow('Message too long');
    });

    it('should throw error for invalid role', () => {
      const invalidProps = { ...validMessageProps, role: 'invalid' as any };
      expect(() => new Message(invalidProps)).toThrow('Invalid message role');
    });

    it('should throw error for missing timestamp', () => {
      const invalidProps = { ...validMessageProps, timestamp: null as any };
      expect(() => new Message(invalidProps)).toThrow('Message timestamp is required');
    });
  });

  describe('business methods', () => {
    let userMessage: Message;
    let assistantMessage: Message;

    beforeEach(() => {
      userMessage = new Message({ ...validMessageProps, role: 'user' });
      assistantMessage = new Message({ ...validMessageProps, role: 'assistant' });
    });

    it('should correctly identify user messages', () => {
      expect(userMessage.isFromUser()).toBe(true);
      expect(userMessage.isFromAssistant()).toBe(false);
    });

    it('should correctly identify assistant messages', () => {
      expect(assistantMessage.isFromUser()).toBe(false);
      expect(assistantMessage.isFromAssistant()).toBe(true);
    });

    it('should detect spiritual themes presence', () => {
      expect(userMessage.hasSpritualThemes()).toBe(true);
      
      const messageWithoutThemes = new Message({
        ...validMessageProps,
        spiritualThemes: [],
      });
      expect(messageWithoutThemes.hasSpritualThemes()).toBe(false);
    });

    it('should detect suggested actions presence', () => {
      expect(userMessage.hasSuggestedActions()).toBe(true);
      
      const messageWithoutActions = new Message({
        ...validMessageProps,
        suggestedActions: [],
      });
      expect(messageWithoutActions.hasSuggestedActions()).toBe(false);
    });

    it('should format timestamp correctly', () => {
      const message = new Message({
        ...validMessageProps,
        timestamp: new Date('2023-01-01T12:00:00Z'),
      });
      
      expect(message.getFormattedTimestamp()).toBeTruthy();
      expect(typeof message.getFormattedTimestamp()).toBe('string');
    });
  });

  describe('static factory methods', () => {
    it('should create user message correctly', () => {
      const content = '  How do I meditate?  ';
      const conversationId = 'conv-123';
      
      const message = Message.createUserMessage(content, conversationId);
      
      expect(message.role).toBe('user');
      expect(message.content).toBe('How do I meditate?'); // Should be trimmed
      expect(message.conversationId).toBe(conversationId);
      expect(message.id).toContain('user-');
      expect(message.timestamp).toBeInstanceOf(Date);
    });

    it('should create assistant message correctly', () => {
      const content = 'Start with 5 minutes of breathing meditation.';
      const conversationId = 'conv-123';
      const spiritualThemes = ['meditation'];
      const suggestedActions = ['Practice daily'];
      const relatedTopics = ['mindfulness'];
      
      const message = Message.createAssistantMessage(
        content,
        conversationId,
        spiritualThemes,
        suggestedActions,
        relatedTopics
      );
      
      expect(message.role).toBe('assistant');
      expect(message.content).toBe(content);
      expect(message.conversationId).toBe(conversationId);
      expect(message.spiritualThemes).toEqual(spiritualThemes);
      expect(message.suggestedActions).toEqual(suggestedActions);
      expect(message.relatedTopics).toEqual(relatedTopics);
      expect(message.id).toContain('assistant-');
    });
  });

  describe('equality and serialization', () => {
    it('should check equality by ID', () => {
      const message1 = new Message(validMessageProps);
      const message2 = new Message(validMessageProps);
      const differentMessage = new Message({ ...validMessageProps, id: 'different-id' });
      
      expect(message1.equals(message2)).toBe(true);
      expect(message1.equals(differentMessage)).toBe(false);
    });

    it('should serialize to JSON correctly', () => {
      const message = new Message(validMessageProps);
      const json = message.toJSON();
      
      expect(json).toEqual(validMessageProps);
    });

    it('should deserialize from JSON correctly', () => {
      const jsonData = { ...validMessageProps };
      const message = Message.fromJSON(jsonData);
      
      expect(message.id).toBe(jsonData.id);
      expect(message.role).toBe(jsonData.role);
      expect(message.content).toBe(jsonData.content);
      expect(message.timestamp).toEqual(new Date(jsonData.timestamp));
    });
  });
});