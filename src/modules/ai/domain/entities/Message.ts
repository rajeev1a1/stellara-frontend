export interface MessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  conversationId?: string;
  spiritualThemes?: string[];
  suggestedActions?: string[];
  relatedTopics?: string[];
}

export class Message {
  private readonly props: MessageProps;

  constructor(props: MessageProps) {
    this.validateMessage(props);
    this.props = { ...props };
  }

  private validateMessage(props: MessageProps): void {
    if (!props.id?.trim()) {
      throw new Error('Message ID is required');
    }

    if (!props.content?.trim()) {
      throw new Error('Message content cannot be empty');
    }

    if (props.content.length > 2000) {
      throw new Error('Message too long. Please keep messages under 2000 characters.');
    }

    if (!['user', 'assistant'].includes(props.role)) {
      throw new Error('Invalid message role. Must be "user" or "assistant"');
    }

    if (!props.timestamp) {
      throw new Error('Message timestamp is required');
    }
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get role(): 'user' | 'assistant' {
    return this.props.role;
  }

  get content(): string {
    return this.props.content;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get conversationId(): string | undefined {
    return this.props.conversationId;
  }

  get spiritualThemes(): string[] {
    return this.props.spiritualThemes || [];
  }

  get suggestedActions(): string[] {
    return this.props.suggestedActions || [];
  }

  get relatedTopics(): string[] {
    return this.props.relatedTopics || [];
  }

  // Business methods
  isFromUser(): boolean {
    return this.props.role === 'user';
  }

  isFromAssistant(): boolean {
    return this.props.role === 'assistant';
  }

  hasSpritualThemes(): boolean {
    return this.spiritualThemes.length > 0;
  }

  hasSuggestedActions(): boolean {
    return this.suggestedActions.length > 0;
  }

  getFormattedTimestamp(): string {
    return this.props.timestamp.toLocaleString();
  }

  // Static factory methods
  static createUserMessage(content: string, conversationId?: string): Message {
    return new Message({
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      conversationId,
    });
  }

  static createAssistantMessage(
    content: string,
    conversationId?: string,
    spiritualThemes?: string[],
    suggestedActions?: string[],
    relatedTopics?: string[]
  ): Message {
    return new Message({
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: content.trim(),
      timestamp: new Date(),
      conversationId,
      spiritualThemes,
      suggestedActions,
      relatedTopics,
    });
  }

  // Equality check
  equals(other: Message): boolean {
    return this.props.id === other.id;
  }

  // Serialization
  toJSON(): MessageProps {
    return { ...this.props };
  }

  static fromJSON(json: MessageProps): Message {
    return new Message({
      ...json,
      timestamp: new Date(json.timestamp),
    });
  }
}