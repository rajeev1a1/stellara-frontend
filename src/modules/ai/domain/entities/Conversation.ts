import { Message } from './Message';

export interface ConversationProps {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
  userId?: string;
}

export class Conversation {
  private readonly props: ConversationProps;

  constructor(props: ConversationProps) {
    this.validateConversation(props);
    this.props = { 
      ...props,
      messages: [...props.messages] // Create a copy to ensure immutability
    };
  }

  private validateConversation(props: ConversationProps): void {
    if (!props.id?.trim()) {
      throw new Error('Conversation ID is required');
    }

    if (!Array.isArray(props.messages)) {
      throw new Error('Messages must be an array');
    }

    if (!props.createdAt) {
      throw new Error('Conversation creation date is required');
    }

    if (!props.updatedAt) {
      throw new Error('Conversation update date is required');
    }

    if (props.updatedAt < props.createdAt) {
      throw new Error('Update date cannot be before creation date');
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get messages(): Message[] {
    return [...this.props.messages]; // Return a copy to maintain immutability
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get summary(): string | undefined {
    return this.props.summary;
  }

  get userId(): string | undefined {
    return this.props.userId;
  }

  // Business methods
  isEmpty(): boolean {
    return this.props.messages.length === 0;
  }

  getMessageCount(): number {
    return this.props.messages.length;
  }

  getUserMessageCount(): number {
    return this.props.messages.filter(msg => msg.isFromUser()).length;
  }

  getAssistantMessageCount(): number {
    return this.props.messages.filter(msg => msg.isFromAssistant()).length;
  }

  getLastMessage(): Message | undefined {
    if (this.isEmpty()) return undefined;
    return this.props.messages[this.props.messages.length - 1];
  }

  getFirstMessage(): Message | undefined {
    if (this.isEmpty()) return undefined;
    return this.props.messages[0];
  }

  hasUserStarted(): boolean {
    const firstMessage = this.getFirstMessage();
    return firstMessage?.isFromUser() ?? false;
  }

  isActive(): boolean {
    // Consider conversation active if last message is within 24 hours
    const lastMessage = this.getLastMessage();
    if (!lastMessage) return false;
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastMessage.timestamp > oneDayAgo;
  }

  getSpritualThemes(): string[] {
    const themes = new Set<string>();
    this.props.messages.forEach(message => {
      message.spiritualThemes.forEach(theme => themes.add(theme));
    });
    return Array.from(themes);
  }

  // Immutable operations that return new instances
  addMessage(message: Message): Conversation {
    // Validate that message belongs to this conversation
    if (message.conversationId && message.conversationId !== this.id) {
      throw new Error('Message conversation ID does not match');
    }

    const newMessages = [...this.props.messages, message];
    
    return new Conversation({
      ...this.props,
      messages: newMessages,
      updatedAt: new Date(),
    });
  }

  updateSummary(summary: string): Conversation {
    if (!summary?.trim()) {
      throw new Error('Summary cannot be empty');
    }

    return new Conversation({
      ...this.props,
      summary: summary.trim(),
      updatedAt: new Date(),
    });
  }

  // Static factory methods
  static createNew(userId?: string): Conversation {
    const now = new Date();
    return new Conversation({
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      createdAt: now,
      updatedAt: now,
      userId,
    });
  }

  static createWithFirstMessage(message: Message, userId?: string): Conversation {
    const conversation = Conversation.createNew(userId);
    return conversation.addMessage(message);
  }

  // Equality check
  equals(other: Conversation): boolean {
    return this.props.id === other.id;
  }

  // Serialization
  toJSON() {
    return {
      id: this.props.id,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
      summary: this.props.summary,
      userId: this.props.userId,
      messages: this.props.messages.map(msg => msg.toJSON()),
    };
  }

  static fromJSON(json: Omit<ConversationProps, 'messages'> & { messages: any[] }): Conversation {
    const messages = json.messages.map(msgData => Message.fromJSON(msgData));
    
    return new Conversation({
      id: json.id,
      messages,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
      summary: json.summary,
      userId: json.userId,
    });
  }
}