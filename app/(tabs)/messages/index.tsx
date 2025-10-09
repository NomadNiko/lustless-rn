import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { SearchIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  CURRENT_USER_ID,
  getAvatarColor,
  getInitials,
  mockConversations,
  type Conversation,
} from "@/src/data/mock-messages";
import { formatConversationTime } from "@/src/utils/time-format";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter((conv) => {
    const query = searchQuery.toLowerCase();
    const matchesName = conv.matchName.toLowerCase().includes(query);
    const matchesMessages = conv.messages.some((msg) =>
      msg.text.toLowerCase().includes(query)
    );
    return matchesName || matchesMessages;
  });

  const renderConversation = ({ item }: { item: Conversation }) => {
    const initials = getInitials(item.matchName);
    const avatarColor = getAvatarColor(item.matchName);
    const isFromCurrentUser =
      item.messages[item.messages.length - 1].senderId === CURRENT_USER_ID;
    const lastMessagePreview = isFromCurrentUser
      ? `You: ${item.lastMessage}`
      : item.lastMessage;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/messages/${item.id}`)}
        activeOpacity={0.7}
      >
        <Box className="px-4 py-3 border-b border-background-100">
          <HStack space="md" className="items-center">
            {/* Avatar */}
            <Box className="relative">
              <Box
                className="items-center justify-center rounded-full w-14 h-14"
                style={{ backgroundColor: avatarColor }}
              >
                <Text className="text-lg text-white font-outfit-semibold">
                  {initials}
                </Text>
              </Box>
              {/* Online indicator */}
              {item.isOnline && (
                <Box
                  className="absolute bottom-0 right-0 w-4 h-4 border-2 rounded-full border-background-0"
                  style={{ backgroundColor: "#10b981" }}
                />
              )}
            </Box>

            {/* Message info */}
            <VStack className="flex-1" space="xs">
              <HStack className="items-center justify-between">
                <Text
                  className={`font-outfit-semibold text-lg ${
                    item.unreadCount > 0
                      ? "text-typography-900"
                      : "text-typography-700"
                  }`}
                >
                  {item.matchName}, {item.matchAge}
                </Text>
                <Text className="text-sm text-typography-400 font-outfit">
                  {formatConversationTime(item.lastMessageTime)}
                </Text>
              </HStack>

              <HStack className="items-center justify-between">
                <Text
                  className={`flex-1 font-outfit ${
                    item.unreadCount > 0
                      ? "text-typography-900 font-outfit-medium"
                      : "text-typography-500"
                  }`}
                  numberOfLines={1}
                >
                  {lastMessagePreview}
                </Text>
                {item.unreadCount > 0 && (
                  <Badge
                    size="sm"
                    variant="solid"
                    action="info"
                    className="ml-2 bg-primary-500"
                  >
                    <BadgeText className="font-outfit-semibold">
                      {item.unreadCount}
                    </BadgeText>
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
      className="bg-background-0"
    >
      <VStack className="flex-1">
        {/* Header */}
        <Box className="px-4 py-3 border-b border-background-100">
          <Heading size="2xl" className="mb-3 text-typography-900 font-ovo">
            Messages
          </Heading>

          {/* Search bar */}
          <Input size="lg" variant="outline">
            <InputSlot className="pl-3">
              <InputIcon as={SearchIcon} className="text-typography-400" />
            </InputSlot>
            <InputField
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="font-outfit"
            />
          </Input>
        </Box>

        {/* Conversations list */}
        {filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Box className="items-center justify-center flex-1 px-8">
            <Text className="text-lg text-center text-typography-500 font-outfit">
              {searchQuery
                ? "No conversations found"
                : "No messages yet. Start exploring to make connections!"}
            </Text>
          </Box>
        )}
      </VStack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
