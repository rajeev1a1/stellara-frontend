import { 
  IAiRepository, 
  AstrologyRequest, 
  AstrologyResponse 
} from '../repositories/IAiRepository';

export interface RequestAstrologyReadingRequest {
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

export interface RequestAstrologyReadingResult {
  success: boolean;
  reading?: AstrologyResponse;
  error?: string;
}

export class RequestAstrologyReading {
  constructor(private aiRepository: IAiRepository) {}

  async execute(request: RequestAstrologyReadingRequest): Promise<RequestAstrologyReadingResult> {
    try {
      // Validate input
      const validationError = this.validateRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError,
        };
      }

      // Prepare astrology request
      const astrologyRequest: AstrologyRequest = {
        birthInfo: {
          dateOfBirth: request.birthInfo.dateOfBirth,
          timeOfBirth: request.birthInfo.timeOfBirth,
          placeOfBirth: request.birthInfo.placeOfBirth.trim(),
          timezone: request.birthInfo.timezone,
        },
        readingType: request.readingType.trim(),
        partnerBirthInfo: request.partnerBirthInfo ? {
          dateOfBirth: request.partnerBirthInfo.dateOfBirth,
          timeOfBirth: request.partnerBirthInfo.timeOfBirth,
          placeOfBirth: request.partnerBirthInfo.placeOfBirth.trim(),
        } : undefined,
      };

      // Send to backend
      const reading = await this.aiRepository.requestAstrologyReading(astrologyRequest);

      return {
        success: true,
        reading,
      };

    } catch (error) {
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  private validateRequest(request: RequestAstrologyReadingRequest): string | null {
    // Validate birth info
    const birthValidation = this.validateBirthInfo(request.birthInfo, 'Your');
    if (birthValidation) return birthValidation;

    // Validate reading type
    if (!request.readingType?.trim()) {
      return 'Reading type is required';
    }

    if (request.readingType.length > 100) {
      return 'Reading type must be under 100 characters';
    }

    // Validate allowed reading types
    const allowedReadingTypes = [
      'natal_chart',
      'daily_horoscope',
      'compatibility',
      'transit',
      'solar_return',
      'lunar_return',
      'composite_chart',
      'synastry'
    ];

    if (!allowedReadingTypes.includes(request.readingType.trim())) {
      return `Invalid reading type. Allowed types: ${allowedReadingTypes.join(', ')}`;
    }

    // Validate partner birth info if provided
    if (request.partnerBirthInfo) {
      // Check if reading type requires partner info
      const partnerReadingTypes = ['compatibility', 'composite_chart', 'synastry'];
      if (!partnerReadingTypes.includes(request.readingType.trim())) {
        return `Partner birth info is not needed for ${request.readingType} reading`;
      }

      const partnerValidation = this.validateBirthInfo(request.partnerBirthInfo, "Partner's");
      if (partnerValidation) return partnerValidation;
    } else {
      // Check if partner info is required for this reading type
      const requiresPartner = ['compatibility', 'composite_chart', 'synastry'];
      if (requiresPartner.includes(request.readingType.trim())) {
        return `Partner birth information is required for ${request.readingType} reading`;
      }
    }

    return null;
  }

  private validateBirthInfo(birthInfo: { dateOfBirth: string; timeOfBirth: string; placeOfBirth: string; timezone?: string }, prefix: string): string | null {
    // Validate date of birth
    if (!birthInfo.dateOfBirth?.trim()) {
      return `${prefix} date of birth is required`;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthInfo.dateOfBirth)) {
      return `${prefix} date of birth must be in YYYY-MM-DD format`;
    }

    // Validate date is a real date
    const date = new Date(birthInfo.dateOfBirth);
    if (isNaN(date.getTime())) {
      return `${prefix} date of birth is not a valid date`;
    }

    // Validate date is not in the future
    if (date > new Date()) {
      return `${prefix} date of birth cannot be in the future`;
    }

    // Validate date is not too far in the past (reasonable birth year limit)
    const minDate = new Date('1900-01-01');
    if (date < minDate) {
      return `${prefix} date of birth cannot be before 1900`;
    }

    // Validate time of birth
    if (!birthInfo.timeOfBirth?.trim()) {
      return `${prefix} time of birth is required`;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(birthInfo.timeOfBirth)) {
      return `${prefix} time of birth must be in HH:MM format (24-hour)`;
    }

    // Validate place of birth
    if (!birthInfo.placeOfBirth?.trim()) {
      return `${prefix} place of birth is required`;
    }

    if (birthInfo.placeOfBirth.length < 2) {
      return `${prefix} place of birth must be at least 2 characters`;
    }

    if (birthInfo.placeOfBirth.length > 100) {
      return `${prefix} place of birth must be under 100 characters`;
    }

    // Validate timezone if provided
    if (birthInfo.timezone) {
      if (birthInfo.timezone.length > 50) {
        return `${prefix} timezone must be under 50 characters`;
      }

      // Basic timezone format validation
      const timezoneRegex = /^[A-Za-z_+\-0-9\/]+$/;
      if (!timezoneRegex.test(birthInfo.timezone)) {
        return `${prefix} timezone format is invalid`;
      }
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
        return 'Astrology service is temporarily unavailable. Please try again later.';
      }
      
      if (error.message.includes('Invalid birth data')) {
        return 'Invalid birth information. Please check your date, time, and location.';
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