import { useState, useContext } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { AuthContext, AuthActionsContext } from "@/src/services/auth/auth-context";

export default function ProfileScreen() {
  const { user, verificationStatus, isLoaded } = useContext(AuthContext);
  const { logOut } = useContext(AuthActionsContext);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text className="text-typography-500 font-outfit">Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="xl">
          {/* Header */}
          <Heading size="2xl" className="text-typography-900 font-ovo">
            Profile
          </Heading>

          {/* User Info Card */}
          {user && (
            <Card className="p-6">
              <VStack space="md">
                <VStack space="xs">
                  <Text size="sm" className="text-typography-500 font-outfit">
                    Name
                  </Text>
                  <Text size="lg" className="text-typography-900 font-outfit-semibold">
                    {user.firstName} {user.lastName}
                  </Text>
                </VStack>

                <Divider />

                <VStack space="xs">
                  <Text size="sm" className="text-typography-500 font-outfit">
                    Email
                  </Text>
                  <Text size="lg" className="text-typography-900 font-outfit-semibold">
                    {user.email}
                  </Text>
                </VStack>

                {user.phoneNumber && (
                  <>
                    <Divider />
                    <VStack space="xs">
                      <Text size="sm" className="text-typography-500 font-outfit">
                        Phone
                      </Text>
                      <HStack space="sm" className="items-center">
                        <Text size="lg" className="text-typography-900 font-outfit-semibold">
                          {user.phoneNumber}
                        </Text>
                        {user.phoneVerified && (
                          <Text size="xs" className="text-success-600 font-outfit">
                            ✓ Verified
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </>
                )}

                <Divider />

                <VStack space="xs">
                  <Text size="sm" className="text-typography-500 font-outfit">
                    Verification Status
                  </Text>
                  <Text size="lg" className="text-typography-900 font-outfit-semibold">
                    {verificationStatus?.currentStep?.replace(/_/g, " ").toUpperCase() || "Unknown"}
                  </Text>
                  {verificationStatus?.isFullyVerified && (
                    <Text size="xs" className="text-success-600 font-outfit">
                      ✓ Fully Verified
                    </Text>
                  )}
                </VStack>

                {user.faceVerificationScore && (
                  <>
                    <Divider />
                    <VStack space="xs">
                      <Text size="sm" className="text-typography-500 font-outfit">
                        Identity Match Score
                      </Text>
                      <Text size="lg" className="text-typography-900 font-outfit-semibold">
                        {user.faceVerificationScore.toFixed(1)}%
                      </Text>
                    </VStack>
                  </>
                )}
              </VStack>
            </Card>
          )}

          {/* Account Actions */}
          <VStack space="md">
            <Button
              size="xl"
              action="negative"
              onPress={handleLogout}
              isDisabled={loading}
              className="w-full"
            >
              <ButtonText className="font-outfit-semibold">
                {loading ? "Logging Out..." : "Logout"}
              </ButtonText>
            </Button>
          </VStack>

          {/* App Info */}
          <VStack space="xs" className="items-center mt-8">
            <Text size="sm" className="text-typography-400 font-outfit">
              Lustless Dating
            </Text>
            <Text size="xs" className="text-typography-400 font-outfit">
              Version 1.0.0
            </Text>
          </VStack>
        </VStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFEFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
