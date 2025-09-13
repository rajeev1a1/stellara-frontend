import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadConversations, Conversation } from '../../modules/ai';
import { IAiRepository } from '../../modules/ai/domain/repositories/IAiRepository';
import { cn } from '../../lib/utils';

interface ConversationListProps {
  aiRepository: IAiRepository;
  onSelectConversation: (conversation: Conversation) => void;
  currentConversation?: Conversation | null;
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  aiRepository,
  onSelectConversation,
  currentConversation,
  className
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = new LoadConversations(aiRepository);

  useEffect(() => {
    loadConversationList();
  }, []);

  const loadConversationList = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loadConversations.execute({ limit: 50 });
      
      if (result.success && result.conversations) {
        setConversations(result.conversations);
      } else {
        setError(result.error || 'Failed to load conversations');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConversationPreview = (conversation: Conversation): string => {
    const firstMessage = conversation.getFirstMessage();
    if (!firstMessage) return 'Empty conversation';
    
    const preview = firstMessage.content;
    return preview.length > 60 ? `${preview.substring(0, 60)}...` : preview;
  };

  const getConversationTitle = (conversation: Conversation): string => {
    if (conversation.summary) {
      return conversation.summary;
    }
    
    const firstMessage = conversation.getFirstMessage();
    if (!firstMessage) return 'New Conversation';
    
    const title = firstMessage.content;
    return title.length > 30 ? `${title.substring(0, 30)}...` : title;
  };

  if (isLoading) {
    return (
      <View className={cn('p-4', className)}>
        <Text variant="body" className="text-neutral-500 dark:text-neutral-400 text-center">
          Loading conversations...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={cn('p-4', className)}>
        <Text variant="body" className="text-red-500 text-center mb-4">
          {error}
        </Text>
        <Button variant="outline" onPress={loadConversationList}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View className={cn('flex-1', className)}>
      {/* Header */}
      <View className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text variant="h4" className="text-neutral-900 dark:text-white">
            Conversations
          </Text>
          <Button variant="ghost" size="sm" onPress={loadConversationList}>
            Refresh
          </Button>
        </View>
        <Text variant="caption" className="text-neutral-600 dark:text-neutral-400 mt-1">
          {conversations.length} conversations
        </Text>
      </View>

      {/* Conversation List */}
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        {conversations.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text variant="body" className="text-neutral-500 dark:text-neutral-400 text-center">
              No conversations yet
            </Text>
            <Text variant="caption" className="text-neutral-400 dark:text-neutral-500 text-center mt-1">
              Start a new chat to begin your spiritual journey
            </Text>
          </View>
        ) : (
          <View className="p-4 space-y-2">
            {conversations.map((conversation) => (
              <TouchableOpacity
                key={conversation.id}
                onPress={() => onSelectConversation(conversation)}
                activeOpacity={0.7}
              >
                <Card 
                  className={cn(
                    'p-4 border',
                    currentConversation?.id === conversation.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
                  )}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text 
                      variant="h6" 
                      className={cn(
                        'flex-1 mr-2',
                        currentConversation?.id === conversation.id
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-neutral-900 dark:text-white'
                      )}
                    >
                      {getConversationTitle(conversation)}
                    </Text>
                    <Text 
                      variant="caption" 
                      className="text-neutral-500 dark:text-neutral-400"
                    >
                      {formatTimestamp(conversation.updatedAt)}
                    </Text>
                  </View>

                  <Text 
                    variant="body" 
                    className="text-neutral-600 dark:text-neutral-300 mb-2"
                  >
                    {getConversationPreview(conversation)}
                  </Text>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center space-x-4">
                      <Text variant="caption" className="text-neutral-500 dark:text-neutral-400">
                        {conversation.getMessageCount()} messages
                      </Text>
                      {conversation.isActive() && (
                        <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                          <Text variant="caption" className="text-green-700 dark:text-green-300">
                            Active
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Spiritual themes */}
                    {conversation.getSpritualThemes().length > 0 && (
                      <View className="flex-row flex-wrap gap-1 max-w-[200px]">
                        {conversation.getSpritualThemes().slice(0, 3).map((theme, index) => (
                          <View 
                            key={index} 
                            className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full"
                          >
                            <Text 
                              variant="caption" 
                              className="text-purple-700 dark:text-purple-300 text-xs"
                            >
                              {theme.replace('_', ' ')}
                            </Text>
                          </View>
                        ))}
                        {conversation.getSpritualThemes().length > 3 && (
                          <Text variant="caption" className="text-neutral-500 dark:text-neutral-400">
                            +{conversation.getSpritualThemes().length - 3}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};