import { Conversation, ConversationProps } from '../Conversation';
import { Message } from '../Message';

describe('Conversation Entity', () => {
  let testMessage1: Message;
  let testMessage2: Message;
  let validConversationProps: ConversationProps;

  beforeEach(() => {
    testMessage1 = Message.createUserMessage('Hello, I need spiritual guidance');
    testMessage2 = Message.createAssistantMessage('I\'m here to help you on your spiritual journey');

    validConversationProps = {
      id: 'conv-test-1',
      messages: [testMessage1, testMessage2],
      createdAt: new Date('2023-01-01T12:00:00Z'),
      updatedAt: new Date('2023-01-01T12:30:00Z'),
      summary: 'User seeking spiritual guidance',
      userId: 'user-123',
    };
  });

  describe('constructor', () => {
    it('should create a conversation with valid properties', () => {
      const conversation = new Conversation(validConversationProps);

      expect(conversation.id).toBe(validConversationProps.id);
      expect(conversation.messages).toEqual(validConversationProps.messages);
      expect(conversation.createdAt).toEqual(validConversationProps.createdAt);
      expect(conversation.updatedAt).toEqual(validConversationProps.updatedAt);
      expect(conversation.summary).toBe(validConversationProps.summary);
      expect(conversation.userId).toBe(validConversationProps.userId);
    });

    it('should create a conversation without optional properties', () => {
      const minimalProps: ConversationProps = {
        id: 'conv-minimal',
        messages: [],
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T12:00:00Z'),
      };

      const conversation = new Conversation(minimalProps);

      expect(conversation.id).toBe(minimalProps.id);
      expect(conversation.messages).toEqual([]);
      expect(conversation.summary).toBeUndefined();
      expect(conversation.userId).toBeUndefined();
    });

    it('should throw error for empty ID', () => {
      const invalidProps = { ...validConversationProps, id: '' };
      expect(() => new Conversation(invalidProps)).toThrow('Conversation ID is required');
    });

    it('should throw error for invalid messages array', () => {
      const invalidProps = { ...validConversationProps, messages: null as any };
      expect(() => new Conversation(invalidProps)).toThrow('Messages must be an array');
    });

    it('should throw error for missing creation date', () => {
      const invalidProps = { ...validConversationProps, createdAt: null as any };
      expect(() => new Conversation(invalidProps)).toThrow('Conversation creation date is required');
    });

    it('should throw error for missing update date', () => {
      const invalidProps = { ...validConversationProps, updatedAt: null as any };
      expect(() => new Conversation(invalidProps)).toThrow('Conversation update date is required');
    });

    it('should throw error when update date is before creation date', () => {
      const invalidProps = {
        ...validConversationProps,
        createdAt: new Date('2023-01-01T12:00:00Z'),
        updatedAt: new Date('2023-01-01T11:00:00Z'), // Before creation
      };
      expect(() => new Conversation(invalidProps)).toThrow('Update date cannot be before creation date');
    });

    it('should create a copy of messages array to maintain immutability', () => {
      const originalMessages = [testMessage1];
      const props = { ...validConversationProps, messages: originalMessages };
      
      const conversation = new Conversation(props);
      
      // Modifying original array should not affect conversation
      originalMessages.push(testMessage2);
      expect(conversation.messages).toHaveLength(1);
    });
  });

  describe('business methods', () => {
    let emptyConversation: Conversation;
    let conversationWithMessages: Conversation;

    beforeEach(() => {
      emptyConversation = new Conversation({
        ...validConversationProps,
        messages: [],
      });

      conversationWithMessages = new Conversation(validConversationProps);
    });

    it('should correctly identify empty conversations', () => {
      expect(emptyConversation.isEmpty()).toBe(true);
      expect(conversationWithMessages.isEmpty()).toBe(false);
    });

    it('should count messages correctly', () => {
      expect(emptyConversation.getMessageCount()).toBe(0);
      expect(conversationWithMessages.getMessageCount()).toBe(2);
    });

    it('should count user messages correctly', () => {
      expect(conversationWithMessages.getUserMessageCount()).toBe(1);
    });

    it('should count assistant messages correctly', () => {
      expect(conversationWithMessages.getAssistantMessageCount()).toBe(1);
    });

    it('should get last message correctly', () => {
      expect(emptyConversation.getLastMessage()).toBeUndefined();
      expect(conversationWithMessages.getLastMessage()).toBe(testMessage2);
    });

    it('should get first message correctly', () => {
      expect(emptyConversation.getFirstMessage()).toBeUndefined();
      expect(conversationWithMessages.getFirstMessage()).toBe(testMessage1);
    });

    it('should detect if user started the conversation', () => {
      expect(conversationWithMessages.hasUserStarted()).toBe(true);

      const assistantStarted = new Conversation({
        ...validConversationProps,
        messages: [testMessage2, testMessage1], // Assistant first
      });
      expect(assistantStarted.hasUserStarted()).toBe(false);
    });

    it('should determine if conversation is active', () => {
      // Recent message - should be active
      const recentMessage = Message.createUserMessage('Recent message');
      const activeConversation = new Conversation({
        ...validConversationProps,
        messages: [recentMessage],
      });
      expect(activeConversation.isActive()).toBe(true);

      // Old message - should not be active
      const oldTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      const oldMessage = new Message({
        id: 'old-msg',
        role: 'user',
        content: 'Old message',
        timestamp: oldTimestamp,
      });
      const inactiveConversation = new Conversation({
        ...validConversationProps,
        messages: [oldMessage],
      });
      expect(inactiveConversation.isActive()).toBe(false);
    });

    it('should collect spiritual themes from all messages', () => {
      const messageWithThemes1 = Message.createAssistantMessage(
        'About meditation',
        'conv-1',
        ['meditation', 'inner_peace']
      );
      const messageWithThemes2 = Message.createAssistantMessage(
        'About chakras',
        'conv-1',
        ['chakra_healing', 'inner_peace'] // inner_peace repeated
      );

      const conversation = new Conversation({
        ...validConversationProps,
        messages: [messageWithThemes1, messageWithThemes2],
      });

      const themes = conversation.getSpritualThemes();
      expect(themes).toContain('meditation');
      expect(themes).toContain('inner_peace');
      expect(themes).toContain('chakra_healing');
      expect(themes).toHaveLength(3); // Should deduplicate
    });
  });

  describe('immutable operations', () => {
    let originalConversation: Conversation;

    beforeEach(() => {
      originalConversation = new Conversation({
        ...validConversationProps,
        messages: [testMessage1],
      });
    });

    it('should add message and return new conversation instance', () => {
      const newMessage = Message.createAssistantMessage('New response');
      const updatedConversation = originalConversation.addMessage(newMessage);

      // Should return new instance
      expect(updatedConversation).not.toBe(originalConversation);

      // Original should be unchanged
      expect(originalConversation.getMessageCount()).toBe(1);

      // New instance should have added message
      expect(updatedConversation.getMessageCount()).toBe(2);
      expect(updatedConversation.getLastMessage()).toBe(newMessage);

      // Should update the updatedAt timestamp
      expect(updatedConversation.updatedAt).not.toEqual(originalConversation.updatedAt);
    });

    it('should throw error when adding message with mismatched conversation ID', () => {
      const messageWithDifferentConvId = new Message({
        id: 'msg-1',
        role: 'user',
        content: 'Test message',
        timestamp: new Date(),
        conversationId: 'different-conv-id',
      });

      expect(() => originalConversation.addMessage(messageWithDifferentConvId))
        .toThrow('Message conversation ID does not match');
    });

    it('should update summary and return new conversation instance', () => {
      const newSummary = 'Updated conversation summary';
      const updatedConversation = originalConversation.updateSummary(newSummary);

      // Should return new instance
      expect(updatedConversation).not.toBe(originalConversation);

      // Original should be unchanged
      expect(originalConversation.summary).toBe(validConversationProps.summary);

      // New instance should have updated summary
      expect(updatedConversation.summary).toBe(newSummary);

      // Should update the updatedAt timestamp
      expect(updatedConversation.updatedAt).not.toEqual(originalConversation.updatedAt);
    });

    it('should throw error for empty summary', () => {
      expect(() => originalConversation.updateSummary(''))
        .toThrow('Summary cannot be empty');
    });
  });

  describe('static factory methods', () => {
    it('should create new empty conversation', () => {
      const userId = 'user-123';
      const conversation = Conversation.createNew(userId);

      expect(conversation.id).toBeTruthy();
      expect(conversation.id).toContain('conv-');
      expect(conversation.isEmpty()).toBe(true);
      expect(conversation.userId).toBe(userId);
      expect(conversation.createdAt).toBeInstanceOf(Date);
      expect(conversation.updatedAt).toEqual(conversation.createdAt);
    });

    it('should create conversation with first message', () => {
      const firstMessage = Message.createUserMessage('Hello');
      const userId = 'user-123';
      const conversation = Conversation.createWithFirstMessage(firstMessage, userId);

      expect(conversation.getMessageCount()).toBe(1);
      expect(conversation.getFirstMessage()).toBe(firstMessage);
      expect(conversation.userId).toBe(userId);
      expect(conversation.hasUserStarted()).toBe(true);
    });
  });

  describe('equality and serialization', () => {
    it('should check equality by ID', () => {
      const conversation1 = new Conversation(validConversationProps);
      const conversation2 = new Conversation(validConversationProps);
      const differentConversation = new Conversation({
        ...validConversationProps,
        id: 'different-id',
      });

      expect(conversation1.equals(conversation2)).toBe(true);
      expect(conversation1.equals(differentConversation)).toBe(false);
    });

    it('should serialize to JSON correctly', () => {
      const conversation = new Conversation(validConversationProps);
      const json = conversation.toJSON();

      expect(json.id).toBe(validConversationProps.id);
      expect(json.messages).toHaveLength(2);
      expect(json.messages[0]).toEqual(testMessage1.toJSON());
      expect(json.messages[1]).toEqual(testMessage2.toJSON());
    });

    it('should deserialize from JSON correctly', () => {
      const jsonData = {
        id: validConversationProps.id,
        createdAt: validConversationProps.createdAt,
        updatedAt: validConversationProps.updatedAt,
        summary: validConversationProps.summary,
        userId: validConversationProps.userId,
        messages: [testMessage1.toJSON(), testMessage2.toJSON()],
      };

      const conversation = Conversation.fromJSON(jsonData);

      expect(conversation.id).toBe(jsonData.id);
      expect(conversation.getMessageCount()).toBe(2);
      expect(conversation.createdAt).toEqual(new Date(jsonData.createdAt));
      expect(conversation.updatedAt).toEqual(new Date(jsonData.updatedAt));
    });
  });
});