import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import COLORS from '@/constants/Colors';

interface Message {
  id: string;
  role: 'user' | 'coach';
  text: string;
  timestamp: Date;
}

const PROMPT_CHIPS = [
  'How do I reset my body language when nervous?',
  'Practice a warm conversation starter',
  'I froze up talking to someone I liked — help',
  'How do I stop seeking approval?',
  "Give me today's mindset reminder",
];

const MOCK_RESPONSES: { keywords: string[]; response: string }[] = [
  {
    keywords: ['nervous', 'anxious', 'anxiety', 'scared', 'fear'],
    response:
      "When nerves hit, your body is trying to protect you — but it's misreading the situation. Try this right now: inhale for 4 counts, hold for 7, exhale for 8. Do it three times. You'll feel your shoulders drop and your jaw unclench. Nerves are just energy. The goal isn't to eliminate them — it's to metabolize them into presence. You're not in danger. You're just alive.",
  },
  {
    keywords: ['eye contact', 'eyes', 'staring', 'gaze'],
    response:
      "Warm eye contact isn't about intensity — it's about softness. Relax the muscles around your eyes. Think of something you genuinely appreciate about the person you're with. Your eyes will naturally soften, and that warmth is felt immediately. A practical rule: hold eye contact about 70% of the time while listening. When you break it, look to the side — not down. Practice this with baristas and cashiers first. Build the muscle before you need it.",
  },
  {
    keywords: ['conversation', 'talk', 'talking', 'speak', 'speaking', 'chat', 'social', 'frozen', 'froze'],
    response:
      "The pressure to be interesting is what kills conversations. Drop it. Your only job is to be genuinely curious. When someone says something, find the thread you actually want to pull — not the one you think you should ask about. 'What was that like for you?' is the most powerful question in any conversation. It invites depth without pressure. And remember: the person who makes others feel truly heard is always the most magnetic person in the room.",
  },
  {
    keywords: ['approval', 'validation', 'needy', 'neediness', 'impress'],
    response:
      "Approval-seeking is just a habit — and like all habits, it can be replaced. Start noticing when you're monitoring how others are responding to you. That internal surveillance is the problem. The antidote isn't indifference — it's abundance. Before your next interaction, remind yourself: you're not there to win anything. You're there to connect, to give, to experience. Let the outcome be whatever it is. That single shift — from seeking to giving — changes everything.",
  },
  {
    keywords: ['body language', 'posture', 'movement', 'slow', 'walk', 'stand'],
    response:
      "Your body broadcasts your internal state before you say a word. The most powerful shift: slow down. Walk 20% slower. Speak 20% slower. Gesture with intention rather than impulse. Confident people don't rush — they move as if they have nowhere more important to be. Also: take up your space. Feet shoulder-width, shoulders back and released (not forced), chest open. This isn't performance — it's permission. You're allowed to be here.",
  },
];

const DEFAULT_RESPONSE =
  "Presence isn't something you perform — it's something you return to. Underneath the noise of self-monitoring, approval-seeking, and outcome-chasing, there's a version of you that's already grounded. Your work isn't to build confidence from scratch. It's to remove what's covering it. Start with one thing today: in your next conversation, let go of the need for it to go a certain way. Just show up. That's enough.";

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const item of MOCK_RESPONSES) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }
  return DEFAULT_RESPONSE;
}

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      ).start();
    };
    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={typingStyles.container}>
      <View style={typingStyles.bubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[typingStyles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
}

const typingStyles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bubble: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textTertiary,
  },
});

function MessageBubble({ message, index }: { message: Message; index: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const isUser = message.role === 'user';

  return (
    <Animated.View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowCoach,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {!isUser && (
        <View style={styles.coachAvatar}>
          <Text style={styles.coachAvatarText}>A</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.messageBubbleUser : styles.messageBubbleCoach,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextCoach]}>
          {message.text}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'coach',
      text: "Hey. I'm Aura — your presence coach. I'm here to help you build genuine confidence, not a performance of it. What's on your mind today?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      console.log(`[Coach] User sent message: "${text.slice(0, 50)}..."`);

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText('');
      setIsTyping(true);
      scrollToBottom();

      console.log('[Coach] Generating mock response...');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const responseText = getMockResponse(text);
      const coachMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'coach',
        text: responseText,
        timestamp: new Date(),
      };

      console.log('[Coach] Response ready, displaying');
      setIsTyping(false);
      setMessages((prev) => [...prev, coachMsg]);
    },
    [scrollToBottom]
  );

  const handleChipPress = (chip: string) => {
    console.log(`[Coach] Prompt chip pressed: "${chip}"`);
    sendMessage(chip);
  };

  const handleSend = () => {
    console.log('[Coach] Send button pressed');
    sendMessage(inputText);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.coachInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>A</Text>
          </View>
          <View>
            <Text style={styles.coachName}>Aura</Text>
            <Text style={styles.coachStatus}>Your presence coach</Text>
          </View>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Prompt chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {PROMPT_CHIPS.map((chip, i) => (
          <AnimatedPressable key={i} style={styles.chip} onPress={() => handleChipPress(chip)}>
            <Text style={styles.chipText} numberOfLines={1}>
              {chip}
            </Text>
          </AnimatedPressable>
        ))}
      </ScrollView>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageList}
        contentContainerStyle={[styles.messageListContent, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} message={msg} index={i} />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 80 }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Aura anything..."
            placeholderTextColor={COLORS.textTertiary}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <AnimatedPressable
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={18} color={inputText.trim() ? '#fff' : COLORS.textTertiary} />
          </AnimatedPressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  headerAvatarText: {
    fontSize: 18,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.primary,
  },
  coachName: {
    fontSize: 16,
    fontFamily: 'DMSans_600SemiBold',
    color: COLORS.text,
  },
  coachStatus: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textTertiary,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  chipsScroll: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxWidth: 240,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.textSecondary,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowCoach: {
    justifyContent: 'flex-start',
  },
  coachAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexShrink: 0,
  },
  coachAvatarText: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    color: COLORS.primary,
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleUser: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleCoach: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'DMSans_400Regular',
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextCoach: {
    color: COLORS.text,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surfaceSecondary,
  },
});
