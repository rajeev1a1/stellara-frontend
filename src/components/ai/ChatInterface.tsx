import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { 
  SendChatMessage, 
  SendChatMessageRequest, 
  Conversation,
  Message 
} from '../../modules/ai';
import { IAiRepository } from '../../modules/ai/domain/repositories/IAiRepository';
import { cn } from '../../lib/utils';

interface ChatInterfaceProps {
  aiRepository: IAiRepository;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  aiRepository, 
  className 
}) => {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const sendChatMessage = new SendChatMessage(aiRepository);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Update messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      setMessages(currentConversation.messages);
    } else {
      setMessages([]);
    }
  }, [currentConversation]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    try {
      const request: SendChatMessageRequest = {
        message: messageText,
        conversation: currentConversation || undefined,
        userContext: {
          spiritualInterests: ['meditation', 'mindfulness'],
          experienceLevel: 'beginner',
          preferredPractices: ['breathing'],
        },
        location: 'home',
        timeOfDay: 'morning',
      };

      const result = await sendChatMessage.execute(request);

      if (result.success && result.updatedConversation) {
        setCurrentConversation(result.updatedConversation);
        // Messages will be updated via useEffect
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className={cn('flex-1', className)}
    >
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        {/* Header */}
        <View className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Text variant="h3" className="text-neutral-900 dark:text-white">
              Stellara AI
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onPress={handleStartNewConversation}
            >
              New Chat
            </Button>
          </View>
          {currentConversation && (
            <Text variant="caption" className="text-neutral-600 dark:text-neutral-400 mt-1">
              {currentConversation.getMessageCount()} messages • {currentConversation.isActive() ? 'Active' : 'Inactive'}
            </Text>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center py-8">
              <Text variant="h4" className="text-neutral-600 dark:text-neutral-400 text-center mb-2">
                Welcome to Stellara
              </Text>
              <Text variant="body" className="text-neutral-500 dark:text-neutral-500 text-center max-w-sm">
                Your AI spiritual advisor is here to guide you on your journey of self-discovery and inner peace.
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </View>
          )}
          
          {isLoading && (
            <View className="py-4">
              <LoadingMessageBubble />
            </View>
          )}
        </ScrollView>

        {/* Error message */}
        {error && (
          <View className="px-4 py-2 bg-red-50 dark:bg-red-900/20">
            <Text variant="caption" className="text-red-600 dark:text-red-400">
              {error}
            </Text>
          </View>
        )}

        {/* Input area */}
        <View className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-4 py-4">
          <View className="flex-row items-end space-x-2">
            <View className="flex-1">
              <Input
                value={inputMessage}
                onChangeText={setInputMessage}
                placeholder="Ask about meditation, spirituality, or life guidance..."
                multiline
                maxLength={2000}
                numberOfLines={1}
                onSubmitEditing={handleSendMessage}
                returnKeyType="send"
                blurOnSubmit={false}
              />
            </View>
            <Button
              onPress={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="min-w-[80px]"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.isFromUser();
  
  return (
    <View className={cn(
      'flex-row',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      <Card className={cn(
        'max-w-[85%] p-3',
        isUser 
          ? 'bg-blue-500 dark:bg-blue-600' 
          : 'bg-white dark:bg-neutral-800'
      )}>
        <Text 
          variant="body"
          className={cn(
            isUser 
              ? 'text-white' 
              : 'text-neutral-900 dark:text-white'
          )}
        >
          {message.content}
        </Text>
        
        {/* Spiritual themes for assistant messages */}
        {!isUser && message.spiritualThemes.length > 0 && (
          <View className="flex-row flex-wrap gap-1 mt-2">
            {message.spiritualThemes.map((theme, index) => (
              <View 
                key={index} 
                className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full"
              >
                <Text 
                  variant="caption" 
                  className="text-purple-700 dark:text-purple-300"
                >
                  {theme.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Suggested actions for assistant messages */}
        {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
          <View className="mt-2 space-y-1">
            <Text 
              variant="caption" 
              className="text-neutral-600 dark:text-neutral-400 font-medium"
            >
              Suggested actions:
            </Text>
            {message.suggestedActions.map((action, index) => (
              <Text 
                key={index}
                variant="caption" 
                className="text-neutral-700 dark:text-neutral-300"
              >
                • {action}
              </Text>
            ))}
          </View>
        )}

        {/* Timestamp */}
        <Text 
          variant="caption" 
          className={cn(
            'mt-2 text-xs',
            isUser 
              ? 'text-blue-100' 
              : 'text-neutral-500 dark:text-neutral-500'
          )}
        >
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </Card>
    </View>
  );
};

const LoadingMessageBubble: React.FC = () => {
  return (
    <View className="flex-row justify-start">
      <Card className="max-w-[85%] p-3 bg-white dark:bg-neutral-800 animate-pulse">
        <Text variant="body" className="text-neutral-900 dark:text-white">
          Thinking...
        </Text>
      </Card>
    </View>
  );
};