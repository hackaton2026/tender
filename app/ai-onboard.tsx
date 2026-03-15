import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { sendChatMessage, INITIAL_SYSTEM_PROMPT, Message } from '../src/utils/ai';
import { useOnboardingStore } from '../src/store/useOnboardingStore';

export default function AIOnboardScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: INITIAL_SYSTEM_PROMPT },
    { role: 'assistant', content: "Hi! I'm here to help you draft your community proposal quickly. Let's start with the basics: What kind of proposal are you making? Is it an event, a project, a policy, or a funding request?" }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const store = useOnboardingStore();

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message to UI immediately
    const updatedMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const aiResponseText = await sendChatMessage(updatedMessages);

      // Check if AI completed the task and outputted JSON
      if (aiResponseText.includes('"COMPLETE": true')) {
        // Try to extract and parse the JSON
        try {
          const match = aiResponseText.match(/\{[\s\S]*"COMPLETE": true[\s\S]*\}/);
          if (match) {
            const proposalData = JSON.parse(match[0]);
            
            // Hydrate the global Zustand store
            store.updateTopLevel('proposalType', proposalData.proposalType || 'project');
            store.updateTopLevel('purpose', proposalData.purpose || '');
            store.updateTopLevel('timeline', proposalData.timeline || '');
            
            if (proposalData.resourceNeeds) {
              store.updateField('resourceNeeds', 'peopleNeeded', proposalData.resourceNeeds.peopleNeeded || '');
              store.updateField('resourceNeeds', 'skillsNeeded', proposalData.resourceNeeds.skillsNeeded || '');
              store.updateField('resourceNeeds', 'location', proposalData.resourceNeeds.location || '');
            }

            // Route user directly to the Camera step to finish up
            router.replace('/camera');
            return; // Stop processing further UI updates
          }
        } catch (e) {
          console.error("Failed to parse completion JSON from AI:", e);
        }
      }

      // Normal conversational response
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: aiResponseText }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out system prompt for rendering
  const visibleMessages = messages.filter(m => m.role !== 'system');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#333" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>

        {/* Chat Log */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer} 
          contentContainerStyle={styles.chatContent}
        >
          {visibleMessages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <View 
                key={index} 
                style={[
                  styles.bubbleContainer, 
                  isUser ? styles.bubbleContainerUser : styles.bubbleContainerAI
                ]}
              >
                {!isUser && <Text style={styles.avatar}>✨</Text>}
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
                  <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
                    {msg.content}
                  </Text>
                </View>
              </View>
            );
          })}
          {isLoading && (
            <View style={[styles.bubbleContainer, styles.bubbleContainerAI]}>
              <Text style={styles.avatar}>✨</Text>
              <View style={[styles.bubble, styles.bubbleAI]}>
                <ActivityIndicator size="small" color="#4A6B5D" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your answer..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Send size={20} color={inputText.trim() && !isLoading ? "#FFF" : "#A0A0A0"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bubbleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  bubbleContainerUser: {
    alignSelf: 'flex-end',
  },
  bubbleContainerAI: {
    alignSelf: 'flex-start',
  },
  avatar: {
    fontSize: 20,
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  bubble: {
    padding: 14,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: '#8AB8A8', // Sage green
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#FFF',
  },
  bubbleTextAI: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, // SafeArea adjustment
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8AB8A8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#EAEAEA',
  },
});
