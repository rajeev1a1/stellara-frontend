import { Conversation } from '../entities/Conversation';

// Request types based on backend API
export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    userProfile?: {
      spiritualInterests?: string[];
      experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
      preferredPractices?: string[];
    };
    location?: string;
    timeOfDay?: string;
  };
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  spiritualThemes: string[];
  suggestedActions?: string[];
  relatedTopics?: string[];
  timestamp: Date;
}

export interface SpiritualGuidanceRequest {
  topic: string;
  userContext: {
    spiritualGoals: string[];
    currentChallenges: string[];
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredPractices: string[];
    timeAvailable?: string;
    previousExperiences: string[];
  };
}

export interface PracticeRecommendation {
  name: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  materials?: string[];
  steps?: string[];
}

export interface SpiritualGuidanceResponse {
  guidance: string;
  practiceRecommendations: PracticeRecommendation[];
  crystalRecommendations?: string[];
  affirmations?: string[];
  journalPrompts?: string[];
  nextSteps: string[];
  relatedTopics?: string[];
}

export interface AstrologyRequest {
  birthInfo: {
    dateOfBirth: string; // YYYY-MM-DD format
    timeOfBirth: string; // HH:MM format
    placeOfBirth: string;
    timezone?: string;
  };
  readingType: string;
  partnerBirthInfo?: {
    dateOfBirth: string;
    timeOfBirth: string;
    placeOfBirth: string;
  };
}

export interface PlanetaryInfluence {
  planet: string;
  house: string;
  sign?: string;
  influence: string;
  strength: 'weak' | 'moderate' | 'strong';
  description?: string;
}

export interface AstrologyResponse {
  reading: string;
  planetaryInfluences: PlanetaryInfluence[];
  luckyElements: {
    colors: string[];
    numbers: number[];
    gemstones: string[];
    days?: string[];
  };
  guidance: string;
  challenges: string[];
  opportunities: string[];
  compatibilityScore?: number;
  nextRecommendedReading?: string;
}

export interface ConversationHistoryRequest {
  limit?: number;
  offset?: number;
  conversationId?: string;
}

export interface ConversationHistoryResponse {
  conversations: Array<{
    id: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
    summary?: string;
  }>;
  total: number;
  hasMore: boolean;
}

export interface IAiRepository {
  // Chat functionality
  sendChatMessage(request: ChatRequest): Promise<ChatResponse>;
  
  // Spiritual guidance
  requestSpiritualGuidance(request: SpiritualGuidanceRequest): Promise<SpiritualGuidanceResponse>;
  
  // Astrology readings
  requestAstrologyReading(request: AstrologyRequest): Promise<AstrologyResponse>;
  
  // Conversation management
  getConversationHistory(request: ConversationHistoryRequest): Promise<ConversationHistoryResponse>;
  
  // Local conversation storage
  saveConversation(conversation: Conversation): Promise<void>;
  loadConversation(conversationId: string): Promise<Conversation | null>;
  loadConversations(limit?: number): Promise<Conversation[]>;
  deleteConversation(conversationId: string): Promise<void>;
}