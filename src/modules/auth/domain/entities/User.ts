export interface UserProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscriptionTier: 'free' | 'premium' | 'elite';
  createdAt: Date;
  profile?: {
    hasCompletedOnboarding?: boolean;
    spiritualInterests?: string[];
  };
}

export class User {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.validateProps(props);
    this.props = { ...props };
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get subscriptionTier(): 'free' | 'premium' | 'elite' {
    return this.props.subscriptionTier;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get profile(): UserProps['profile'] {
    return this.props.profile;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get initials(): string {
    const firstInitial = this.firstName.charAt(0).toUpperCase();
    const lastInitial = this.lastName.charAt(0).toUpperCase();
    return lastInitial ? firstInitial + lastInitial : firstInitial;
  }

  isPremium(): boolean {
    return this.subscriptionTier === 'premium' || this.subscriptionTier === 'elite';
  }

  hasCompletedOnboarding(): boolean {
    return this.profile?.hasCompletedOnboarding === true;
  }

  private validateProps(props: UserProps): void {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(props.email)) {
      throw new Error('Invalid email format');
    }

    // First name validation
    if (!props.firstName.trim()) {
      throw new Error('First name is required');
    }

    // Subscription tier validation
    const validTiers = ['free', 'premium', 'elite'];
    if (!validTiers.includes(props.subscriptionTier)) {
      throw new Error('Invalid subscription tier');
    }
  }
}