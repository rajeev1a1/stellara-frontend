import { 
  IAiRepository, 
  SpiritualGuidanceRequest, 
  SpiritualGuidanceResponse 
} from '../repositories/IAiRepository';

export interface RequestSpiritualGuidanceRequest {
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

export interface RequestSpiritualGuidanceResult {
  success: boolean;
  guidance?: SpiritualGuidanceResponse;
  error?: string;
}

export class RequestSpiritualGuidance {
  constructor(private aiRepository: IAiRepository) {}

  async execute(request: RequestSpiritualGuidanceRequest): Promise<RequestSpiritualGuidanceResult> {
    try {
      // Validate input
      const validationError = this.validateRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Prepare guidance request
      const guidanceRequest: SpiritualGuidanceRequest = {
        topic: request.topic.trim(),
        userContext: request.userContext,
      };

      // Send to backend
      const guidance = await this.aiRepository.requestSpiritualGuidance(guidanceRequest);

      return {
        success: true,
        guidance,
      };

    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  private validateRequest(request: RequestSpiritualGuidanceRequest): string | null {
    if (!request.topic?.trim()) {
      return 'Topic cannot be empty';
    }

    if (request.topic.length > 200) {
      return 'Topic too long. Please keep topics under 200 characters.';
    }

    if (!request.userContext) {
      return 'User context is required';
    }

    const { userContext } = request;

    if (!userContext.experienceLevel || 
        !['beginner', 'intermediate', 'advanced'].includes(userContext.experienceLevel)) {
      return 'Invalid experience level. Must be beginner, intermediate, or advanced.';
    }

    if (!Array.isArray(userContext.spiritualGoals) || userContext.spiritualGoals.length === 0) {
      return 'At least one spiritual goal is required';
    }

    if (!Array.isArray(userContext.currentChallenges) || userContext.currentChallenges.length === 0) {
      return 'At least one current challenge is required';
    }

    if (!Array.isArray(userContext.preferredPractices) || userContext.preferredPractices.length === 0) {
      return 'At least one preferred practice is required';
    }

    if (!Array.isArray(userContext.previousExperiences)) {
      return 'Previous experiences must be an array';
    }

    // Validate array lengths
    if (userContext.spiritualGoals.length > 10) {
      return 'Too many spiritual goals. Please limit to 10 or fewer.';
    }

    if (userContext.currentChallenges.length > 10) {
      return 'Too many challenges. Please limit to 10 or fewer.';
    }

    if (userContext.preferredPractices.length > 15) {
      return 'Too many preferred practices. Please limit to 15 or fewer.';
    }

    if (userContext.previousExperiences.length > 20) {
      return 'Too many previous experiences. Please limit to 20 or fewer.';
    }

    // Validate string lengths in arrays
    const validateStringArray = (arr: string[], name: string, maxLength: number) => {
      for (const item of arr) {
        if (typeof item !== 'string' || !item.trim()) {
          return `All ${name} must be non-empty strings`;
        }
        if (item.length > maxLength) {
          return `${name} items must be under ${maxLength} characters`;
        }
      }
      return null;
    };

    const goalValidation = validateStringArray(userContext.spiritualGoals, 'spiritual goals', 100);
    if (goalValidation) return goalValidation;

    const challengeValidation = validateStringArray(userContext.currentChallenges, 'challenges', 100);
    if (challengeValidation) return challengeValidation;

    const practiceValidation = validateStringArray(userContext.preferredPractices, 'practices', 50);
    if (practiceValidation) return practiceValidation;

    const experienceValidation = validateStringArray(userContext.previousExperiences, 'experiences', 200);
    if (experienceValidation) return experienceValidation;

    if (userContext.timeAvailable && userContext.timeAvailable.length > 50) {
      return 'Time available description must be under 50 characters';
    }

    return null;
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) {
      // Handle specific API errors
      if (error.message.includes('Authentication required')) {
        return 'Authentication required. Please log in.';
      }
      
      if (error.message.includes('Access denied')) {
        return 'Access denied. Please check your permissions.';
      }
      
      if (error.message.includes('Too many requests')) {
        return 'Too many requests. Please try again later.';
      }
      
      if (error.message.includes('temporarily unavailable')) {
        return 'Spiritual guidance service is temporarily unavailable. Please try again later.';
      }
      
      if (error.message.includes('Invalid request data')) {
        return 'Invalid request. Please check your input and try again.';
      }

      if (error.message.includes('Network connection failed')) {
        return 'Network connection failed. Please check your internet connection.';
      }

      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }
}