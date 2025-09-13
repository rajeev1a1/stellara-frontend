import { Message } from '../entities/Message';
import { Conversation } from '../entities/Conversation';
import { IAiRepository, ChatRequest, ChatResponse } from '../repositories/IAiRepository';

export interface SendChatMessageRequest {
  message: string;
  conversation?: Conversation;
  userContext?: {
    spiritualInterests?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    preferredPractices?: string[];
  };
  location?: string;
  timeOfDay?: string;
}

export interface SendChatMessageResult {
  success: boolean;
  updatedConversation?: Conversation;
  assistantMessage?: Message;
  error?: string;
}

export class SendChatMessage {
  constructor(private aiRepository: IAiRepository) {}

  async execute(request: SendChatMessageRequest): Promise<SendChatMessageResult> {
    try {
      // Validate input
      const validationError = this.validateRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Create user message
      const userMessage = Message.createUserMessage(
        request.message,
        request.conversation?.id
      );

      // Update conversation with user message
      let currentConversation = request.conversation;
      if (currentConversation) {
        currentConversation = currentConversation.addMessage(userMessage);
      } else {
        currentConversation = Conversation.createWithFirstMessage(userMessage);
      }

      // Prepare chat request for backend
      const chatRequest: ChatRequest = {
        message: request.message,
        conversationId: currentConversation.id,
        context: {
          userProfile: request.userContext,
          location: request.location,
          timeOfDay: request.timeOfDay,
        },
      };

      // Send to backend
      const chatResponse: ChatResponse = await this.aiRepository.sendChatMessage(chatRequest);

      // Create assistant message from response
      const assistantMessage = Message.createAssistantMessage(
        chatResponse.message,
        chatResponse.conversationId,
        chatResponse.spiritualThemes,
        chatResponse.suggestedActions,
        chatResponse.relatedTopics
      );

      // Update conversation with assistant message
      const finalConversation = currentConversation.addMessage(assistantMessage);

      // Save conversation locally
      await this.aiRepository.saveConversation(finalConversation);

      return {
        success: true,
        updatedConversation: finalConversation,
        assistantMessage,
      };

    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  private validateRequest(request: SendChatMessageRequest): string | null {
    if (!request.message?.trim()) {
      return 'Message cannot be empty';
    }

    if (request.message.length > 2000) {
      return 'Message too long. Please keep messages under 2000 characters.';
    }

    if (request.userContext?.experienceLevel && 
        !['beginner', 'intermediate', 'advanced'].includes(request.userContext.experienceLevel)) {
      return 'Invalid experience level. Must be beginner, intermediate, or advanced.';
    }

    return null;
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      // Handle specific API errors
      if (error.message.includes('Authentication required')) {
        return 'Authentication required. Please log in.';
      }
      
      if (error.message.includes('Message too long')) {
        return 'Message too long. Please keep messages under 2000 characters.';
      }
      
      if (error.message.includes('temporarily unavailable')) {
        return 'AI service is temporarily unavailable. Please try again later.';
      }
      
      if (error.message.includes('I can only provide')) {
        return error.message; // Return the specific content policy message
      }
      
      if (error.message.includes('Invalid request data')) {
        return 'Invalid request. Please check your input and try again.';
      }

      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}