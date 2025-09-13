import { 
  IAiRepository, 
  ChatRequest, 
  ChatResponse, 
  SpiritualGuidanceRequest, 
  SpiritualGuidanceResponse,
  AstrologyRequest,
  AstrologyResponse,
  ConversationHistoryRequest,
  ConversationHistoryResponse
} from '../../domain/repositories/IAiRepository';
import { Conversation } from '../../domain/entities/Conversation';

export class AiRepository implements IAiRepository {
  private readonly baseUrl: string;
  private readonly getAuthToken: () => Promise<string | null>;

  constructor(baseUrl: string, getAuthToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.getAuthToken = getAuthToken;
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return {
        ...data,
        timestamp: new Date(data.timestamp),
      };
    } catch (error) {
      this.handleNetworkError(error);
      throw error; // This won't be reached due to handleNetworkError throwing
    }
  }

  async requestSpiritualGuidance(request: SpiritualGuidanceRequest): Promise<SpiritualGuidanceResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/ai/spiritual-guidance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      this.handleNetworkError(error);
      throw error;
    }
  }

  async requestAstrologyReading(request: AstrologyRequest): Promise<AstrologyResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.baseUrl}/ai/astrology`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      this.handleNetworkError(error);
      throw error;
    }
  }

  async getConversationHistory(request: ConversationHistoryRequest): Promise<ConversationHistoryResponse> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams();
      if (request.limit !== undefined) queryParams.append('limit', request.limit.toString());
      if (request.offset !== undefined) queryParams.append('offset', request.offset.toString());
      if (request.conversationId) queryParams.append('conversationId', request.conversationId);

      const url = `${this.baseUrl}/ai/conversations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const data = await response.json();
      return {
        ...data,
        conversations: data.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        })),
      };
    } catch (error) {
      this.handleNetworkError(error);
      throw error;
    }
  }

  // Local storage methods for conversations
  async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const key = `stellara_conversation_${conversation.id}`;
      const data = JSON.stringify(conversation.toJSON());
      await this.setStorageItem(key, data);

      // Also maintain a list of conversation IDs for easy retrieval
      const conversationIds = await this.getConversationIds();
      if (!conversationIds.includes(conversation.id)) {
        conversationIds.push(conversation.id);
        await this.setStorageItem('stellara_conversation_ids', JSON.stringify(conversationIds));
      }
    } catch (error) {
      throw new Error(`Failed to save conversation: ${error}`);
    }
  }

  async loadConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const key = `stellara_conversation_${conversationId}`;
      const data = await this.getStorageItem(key);
      
      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      return Conversation.fromJSON(parsed);
    } catch (error) {
      throw new Error(`Failed to load conversation: ${error}`);
    }
  }

  async loadConversations(limit?: number): Promise<Conversation[]> {
    try {
      const conversationIds = await this.getConversationIds();
      const conversations: Conversation[] = [];

      // Sort by creation date (most recent first)
      const sortedIds = conversationIds.reverse();
      const idsToLoad = limit ? sortedIds.slice(0, limit) : sortedIds;

      for (const id of idsToLoad) {
        try {
          const conversation = await this.loadConversation(id);
          if (conversation) {
            conversations.push(conversation);
          }
        } catch (error) {
          // Skip corrupted conversations but continue loading others
          console.warn(`Failed to load conversation ${id}:`, error);
        }
      }

      return conversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      throw new Error(`Failed to load conversations: ${error}`);
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const key = `stellara_conversation_${conversationId}`;
      await this.removeStorageItem(key);

      // Remove from conversation IDs list
      const conversationIds = await this.getConversationIds();
      const updatedIds = conversationIds.filter(id => id !== conversationId);
      await this.setStorageItem('stellara_conversation_ids', JSON.stringify(updatedIds));
    } catch (error) {
      throw new Error(`Failed to delete conversation: ${error}`);
    }
  }

  // Private helper methods
  private async getConversationIds(): Promise<string[]> {
    try {
      const data = await this.getStorageItem('stellara_conversation_ids');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = 'Request failed';
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If response body is not JSON, use status text
      errorMessage = response.statusText || `HTTP ${response.status}`;
    }

    // Map specific HTTP status codes to user-friendly messages
    switch (response.status) {
      case 401:
        throw new Error('Authentication required');
      case 403:
        throw new Error('Access denied');
      case 429:
        throw new Error('Too many requests. Please try again later.');
      case 500:
        throw new Error('AI service is temporarily unavailable. Please try again later.');
      case 400:
        // Check for specific error messages from backend
        if (errorMessage.toLowerCase().includes('message too long')) {
          throw new Error('Message too long');
        }
        if (errorMessage.toLowerCase().includes('invalid request')) {
          throw new Error('Invalid request data');
        }
        throw new Error(errorMessage);
      default:
        throw new Error(errorMessage);
    }
  }

  private handleNetworkError(error: unknown): never {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network connection failed. Please check your internet connection.');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }

  // Platform-agnostic storage methods (to be implemented based on platform)
  private async getStorageItem(key: string): Promise<string | null> {
    // In React Native, this would use AsyncStorage
    // In web, this would use localStorage
    // For now, implementing with localStorage for web compatibility
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    // TODO: Implement AsyncStorage for React Native when needed
    return null;
  }

  private async setStorageItem(key: string, value: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
    // TODO: Implement AsyncStorage for React Native when needed
    throw new Error('Storage not available');
  }

  private async removeStorageItem(key: string): Promise<void> {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
    // TODO: Implement AsyncStorage for React Native when needed
    throw new Error('Storage not available');
  }
}