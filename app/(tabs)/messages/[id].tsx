import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ChevronLeftIcon, Icon } from "@/components/ui/icon";
import { Input, InputField } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  CURRENT_USER_ID,
  getAvatarColor,
  getConversationById,
  getInitials,
  type Message,
} from "@/src/data/mock-messages";
import {
  formatDateSeparator,
  formatFullMessageTime,
  shouldShowDateSeparator,
} from "@/src/utils/time-format";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const conversation = getConversationById(id);

  useEffect(() => {
    // No need for manual scroll with inverted FlatList
  }, []);

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container} className="bg-background-0">
        <VStack className="items-center justify-center flex-1">
          <Text className="text-typography-500 font-outfit">
            Conversation not found
          </Text>
        </VStack>
      </SafeAreaView>
    );
  }

  const initials = getInitials(conversation.matchName);
  const avatarColor = getAvatarColor(conversation.matchName);

  const handleSend = () => {
    if (messageText.trim()) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", messageText);
      setMessageText("");
      // Would update the conversation state here
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.senderId === CURRENT_USER_ID;
    const previousMessage = index > 0 ? conversation.messages[index - 1] : null;
    const showDateSeparator = shouldShowDateSeparator(
      item.timestamp,
      previousMessage?.timestamp || null
    );

    // Check if we should group this message with the next one (same sender, within 1 minute)
    const nextMessage = conversation.messages[index + 1];
    const isGroupedWithNext =
      nextMessage &&
      nextMessage.senderId === item.senderId &&
      nextMessage.timestamp.getTime() - item.timestamp.getTime() < 60000;

    return (
      <>
        {showDateSeparator && (
          <Box className="items-center py-4">
            <Box className="px-3 py-1 rounded-full bg-background-100">
              <Text className="text-xs text-typography-500 font-outfit">
                {formatDateSeparator(item.timestamp)}
              </Text>
            </Box>
          </Box>
        )}

        <Box
          className={`px-4 ${isGroupedWithNext ? "pb-1" : "pb-3"}`}
          style={{ alignItems: isCurrentUser ? "flex-end" : "flex-start" }}
        >
          <HStack
            space="sm"
            className={`max-w-[80%] ${isCurrentUser ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar for received messages */}
            {!isCurrentUser && !isGroupedWithNext && (
              <Box
                className="items-center justify-center w-8 h-8 mt-1 rounded-full"
                style={{ backgroundColor: avatarColor }}
              >
                <Text className="text-xs text-white font-outfit-semibold">
                  {initials}
                </Text>
              </Box>
            )}
            {!isCurrentUser && isGroupedWithNext && <Box className="w-8" />}

            {/* Message bubble */}
            <VStack space="xs" className="flex-shrink">
              <Box
                className={`px-4 py-2 rounded-2xl ${
                  isCurrentUser ? "bg-primary-500" : "bg-background-100"
                }`}
              >
                <Text
                  className="font-outfit"
                  style={{
                    fontSize: 16,
                    lineHeight: 22,
                    color: isCurrentUser ? "#000000" : "#ffffff",
                  }}
                >
                  {item.text}
                </Text>
              </Box>
              {!isGroupedWithNext && (
                <Text
                  className={`text-typography-400 text-xs font-outfit ${
                    isCurrentUser ? "text-right" : "text-left"
                  }`}
                >
                  {formatFullMessageTime(item.timestamp)}
                </Text>
              )}
            </VStack>
          </HStack>
        </Box>
      </>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
      className="bg-background-0"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <VStack className="flex-1">
          {/* Header */}
          <Box className="px-4 py-3 border-b border-background-100">
            <HStack space="md" className="items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Icon
                  as={ChevronLeftIcon}
                  size="xl"
                  className="text-typography-900"
                />
              </TouchableOpacity>

              <HStack space="sm" className="items-center flex-1">
                {/* Avatar */}
                <Box className="relative">
                  <Box
                    className="items-center justify-center w-10 h-10 rounded-full"
                    style={{ backgroundColor: avatarColor }}
                  >
                    <Text className="text-sm text-white font-outfit-semibold">
                      {initials}
                    </Text>
                  </Box>
                  {conversation.isOnline && (
                    <Box
                      className="absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full border-background-0"
                      style={{ backgroundColor: "#10b981" }}
                    />
                  )}
                </Box>

                {/* Name and status */}
                <VStack>
                  <Text className="text-lg font-outfit-semibold text-typography-900">
                    {conversation.matchName}, {conversation.matchAge}
                  </Text>
                  {conversation.isOnline && (
                    <Text className="text-xs text-typography-500 font-outfit">
                      Active now
                    </Text>
                  )}
                </VStack>
              </HStack>
            </HStack>
          </Box>

          {/* Messages list */}
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            data={[...conversation.messages].reverse()}
            inverted
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 }}
            keyboardDismissMode="interactive"
          />

          {/* Message input */}
          <Box className="px-4 py-3 border-t border-background-100">
            <HStack space="sm" className="items-center">
              <Box className="flex-1">
                <Input size="lg" variant="outline">
                  <InputField
                    placeholder="Type a message..."
                    value={messageText}
                    onChangeText={setMessageText}
                    className="font-outfit"
                    multiline
                    maxLength={1000}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                    blurOnSubmit={false}
                    textAlignVertical="center"
                    style={{ paddingTop: 8 }}
                  />
                </Input>
              </Box>

              <Pressable
                onPress={handleSend}
                disabled={!messageText.trim()}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  messageText.trim() ? "bg-primary-500" : "bg-background-200"
                }`}
              >
                <Text className="text-lg text-white font-outfit-bold">↑</Text>
              </Pressable>
            </HStack>
          </Box>
        </VStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
