import { IAiRepository } from '../repositories/IAiRepository';
import { Conversation } from '../entities/Conversation';

export interface LoadConversationsRequest {
  limit?: number;
}

export interface LoadConversationsResult {
  success: boolean;
  conversations?: Conversation[];
  error?: string;
}

export class LoadConversations {
  constructor(private aiRepository: IAiRepository) {}

  async execute(request: LoadConversationsRequest = {}): Promise<LoadConversationsResult> {
    try {
      // Validate input
      const validationError = this.validateRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Load conversations from local storage
      const conversations = await this.aiRepository.loadConversations(request.limit);

      return {
        success: true,
        conversations,
      };

    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  private validateRequest(request: LoadConversationsRequest): string | null {
    if (request.limit !== undefined) {
      if (!Number.isInteger(request.limit) || request.limit < 1) {
        return 'Limit must be a positive integer';
      }

      if (request.limit > 100) {
        return 'Limit cannot exceed 100 conversations';
      }
    }

    return null;
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      if (error.message.includes('Failed to load conversations')) {
        return 'Failed to load conversations. Please try again.';
      }

      return error.message;
    }

    return 'An unexpected error occurred while loading conversations.';
  }
}