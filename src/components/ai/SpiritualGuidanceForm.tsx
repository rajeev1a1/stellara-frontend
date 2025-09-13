import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { 
  RequestSpiritualGuidance,
  RequestSpiritualGuidanceRequest 
} from '../../modules/ai/domain/use-cases/RequestSpiritualGuidance';
import { SpiritualGuidanceResponse } from '../../modules/ai/domain/repositories/IAiRepository';
import { IAiRepository } from '../../modules/ai/domain/repositories/IAiRepository';
import { cn } from '../../lib/utils';

interface SpiritualGuidanceFormProps {
  aiRepository: IAiRepository;
  className?: string;
}

export const SpiritualGuidanceForm: React.FC<SpiritualGuidanceFormProps> = ({
  aiRepository,
  className
}) => {
  const [formData, setFormData] = useState<RequestSpiritualGuidanceRequest>({
    topic: '',
    userContext: {
      spiritualGoals: [''],
      currentChallenges: [''],
      experienceLevel: 'beginner',
      preferredPractices: [''],
      timeAvailable: '',
      previousExperiences: [''],
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guidance, setGuidance] = useState<SpiritualGuidanceResponse | null>(null);

  const requestSpiritualGuidance = new RequestSpiritualGuidance(aiRepository);

  const updateFormField = <K extends keyof RequestSpiritualGuidanceRequest>(
    field: K, 
    value: RequestSpiritualGuidanceRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateContextField = <K extends keyof RequestSpiritualGuidanceRequest['userContext']>(
    field: K,
    value: RequestSpiritualGuidanceRequest['userContext'][K]
  ) => {
    setFormData(prev => ({
      ...prev,
      userContext: { ...prev.userContext, [field]: value }
    }));
  };

  const updateArrayField = (field: 'spiritualGoals' | 'currentChallenges' | 'preferredPractices' | 'previousExperiences', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      userContext: {
        ...prev.userContext,
        [field]: prev.userContext[field].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addArrayField = (field: 'spiritualGoals' | 'currentChallenges' | 'preferredPractices' | 'previousExperiences') => {
    setFormData(prev => ({
      ...prev,
      userContext: {
        ...prev.userContext,
        [field]: [...prev.userContext[field], '']
      }
    }));
  };

  const removeArrayField = (field: 'spiritualGoals' | 'currentChallenges' | 'preferredPractices' | 'previousExperiences', index: number) => {
    setFormData(prev => ({
      ...prev,
      userContext: {
        ...prev.userContext,
        [field]: prev.userContext[field].filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setGuidance(null);

    try {
      // Filter out empty strings from arrays
      const cleanedRequest: RequestSpiritualGuidanceRequest = {
        ...formData,
        userContext: {
          ...formData.userContext,
          spiritualGoals: formData.userContext.spiritualGoals.filter(g => g.trim()),
          currentChallenges: formData.userContext.currentChallenges.filter(c => c.trim()),
          preferredPractices: formData.userContext.preferredPractices.filter(p => p.trim()),
          previousExperiences: formData.userContext.previousExperiences.filter(e => e.trim()),
        },
      };

      const result = await requestSpiritualGuidance.execute(cleanedRequest);

      if (result.success && result.guidance) {
        setGuidance(result.guidance);
      } else {
        setError(result.error || 'Failed to get spiritual guidance');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      topic: '',
      userContext: {
        spiritualGoals: [''],
        currentChallenges: [''],
        experienceLevel: 'beginner',
        preferredPractices: [''],
        timeAvailable: '',
        previousExperiences: [''],
      },
    });
    setGuidance(null);
    setError(null);
  };

  if (guidance) {
    return (
      <ScrollView className={cn('flex-1 bg-neutral-50 dark:bg-neutral-900', className)}>
        <View className="p-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text variant="h3" className="text-neutral-900 dark:text-white">
              Spiritual Guidance
            </Text>
            <Button variant="outline" onPress={resetForm}>
              New Request
            </Button>
          </View>

          {/* Guidance Content */}
          <Card className="p-6 mb-6">
            <Text variant="h5" className="text-neutral-900 dark:text-white mb-4">
              Guidance for: {formData.topic}
            </Text>
            <Text variant="body" className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {guidance.guidance}
            </Text>
          </Card>

          {/* Practice Recommendations */}
          {guidance.practiceRecommendations.length > 0 && (
            <Card className="p-6 mb-6">
              <Text variant="h5" className="text-neutral-900 dark:text-white mb-4">
                Recommended Practices
              </Text>
              {guidance.practiceRecommendations.map((practice, index) => (
                <View key={index} className="mb-4 last:mb-0">
                  <Text variant="h6" className="text-neutral-900 dark:text-white mb-2">
                    {practice.name}
                  </Text>
                  <Text variant="body" className="text-neutral-700 dark:text-neutral-300 mb-2">
                    {practice.description}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <Text variant="caption" className="text-neutral-600 dark:text-neutral-400">
                      Duration: {practice.duration}
                    </Text>
                    <View className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                      <Text variant="caption" className="text-purple-700 dark:text-purple-300">
                        {practice.difficulty}
                      </Text>
                    </View>
                  </View>
                  {practice.steps && practice.steps.length > 0 && (
                    <View className="mt-2">
                      <Text variant="caption" className="text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                        Steps:
                      </Text>
                      {practice.steps.map((step, stepIndex) => (
                        <Text key={stepIndex} variant="caption" className="text-neutral-600 dark:text-neutral-400 ml-2">
                          {stepIndex + 1}. {step}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </Card>
          )}

          {/* Affirmations */}
          {guidance.affirmations && guidance.affirmations.length > 0 && (
            <Card className="p-6 mb-6">
              <Text variant="h5" className="text-neutral-900 dark:text-white mb-4">
                Affirmations
              </Text>
              {guidance.affirmations.map((affirmation, index) => (
                <Text key={index} variant="body" className="text-neutral-700 dark:text-neutral-300 mb-2 italic">
                  "{affirmation}"
                </Text>
              ))}
            </Card>
          )}

          {/* Journal Prompts */}
          {guidance.journalPrompts && guidance.journalPrompts.length > 0 && (
            <Card className="p-6 mb-6">
              <Text variant="h5" className="text-neutral-900 dark:text-white mb-4">
                Journal Prompts
              </Text>
              {guidance.journalPrompts.map((prompt, index) => (
                <Text key={index} variant="body" className="text-neutral-700 dark:text-neutral-300 mb-2">
                  • {prompt}
                </Text>
              ))}
            </Card>
          )}

          {/* Next Steps */}
          <Card className="p-6">
            <Text variant="h5" className="text-neutral-900 dark:text-white mb-4">
              Next Steps
            </Text>
            {guidance.nextSteps.map((step, index) => (
              <Text key={index} variant="body" className="text-neutral-700 dark:text-neutral-300 mb-2">
                {index + 1}. {step}
              </Text>
            ))}
          </Card>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={cn('flex-1 bg-neutral-50 dark:bg-neutral-900', className)}>
      <View className="p-4">
        {/* Header */}
        <Text variant="h3" className="text-neutral-900 dark:text-white mb-6">
          Request Spiritual Guidance
        </Text>

        {/* Topic */}
        <Card className="p-4 mb-4">
          <Text variant="h6" className="text-neutral-900 dark:text-white mb-3">
            What topic would you like guidance on?
          </Text>
          <Input
            value={formData.topic}
            onChangeText={(value: string) => updateFormField('topic', value)}
            placeholder="e.g., Finding inner peace, dealing with anxiety, spiritual growth..."
            multiline
            numberOfLines={2}
            maxLength={200}
          />
        </Card>

        {/* Experience Level */}
        <Card className="p-4 mb-4">
          <Text variant="h6" className="text-neutral-900 dark:text-white mb-3">
            Your Experience Level
          </Text>
          <View className="flex-row gap-2">
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <Button
                key={level}
                variant={formData.userContext.experienceLevel === level ? 'default' : 'outline'}
                size="sm"
                onPress={() => updateContextField('experienceLevel', level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </View>
        </Card>

        {/* Spiritual Goals */}
        <Card className="p-4 mb-4">
          <Text variant="h6" className="text-neutral-900 dark:text-white mb-3">
            Spiritual Goals
          </Text>
          {formData.userContext.spiritualGoals.map((goal, index) => (
            <View key={index} className="flex-row gap-2 mb-2">
              <Input
                className="flex-1"
                value={goal}
                onChangeText={(value: string) => updateArrayField('spiritualGoals', index, value)}
                placeholder="e.g., Develop daily meditation practice"
                maxLength={100}
              />
              {formData.userContext.spiritualGoals.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => removeArrayField('spiritualGoals', index)}
                >
                  Remove
                </Button>
              )}
            </View>
          ))}
          {formData.userContext.spiritualGoals.length < 10 && (
            <Button
              variant="outline"
              size="sm"
              onPress={() => addArrayField('spiritualGoals')}
            >
              Add Goal
            </Button>
          )}
        </Card>

        {/* Current Challenges */}
        <Card className="p-4 mb-4">
          <Text variant="h6" className="text-neutral-900 dark:text-white mb-3">
            Current Challenges
          </Text>
          {formData.userContext.currentChallenges.map((challenge, index) => (
            <View key={index} className="flex-row gap-2 mb-2">
              <Input
                className="flex-1"
                value={challenge}
                onChangeText={(value: string) => updateArrayField('currentChallenges', index, value)}
                placeholder="e.g., Stress from work, difficulty sleeping"
                maxLength={100}
              />
              {formData.userContext.currentChallenges.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => removeArrayField('currentChallenges', index)}
                >
                  Remove
                </Button>
              )}
            </View>
          ))}
          {formData.userContext.currentChallenges.length < 10 && (
            <Button
              variant="outline"
              size="sm"
              onPress={() => addArrayField('currentChallenges')}
            >
              Add Challenge
            </Button>
          )}
        </Card>

        {/* Error message */}
        {error && (
          <Card className="p-4 mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <Text variant="body" className="text-red-600 dark:text-red-400">
              {error}
            </Text>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={!formData.topic.trim() || isLoading}
          className="mb-8"
        >
          {isLoading ? 'Getting Guidance...' : 'Get Spiritual Guidance'}
        </Button>
      </View>
    </ScrollView>
  );
};