import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AuthContext } from "@/src/services/auth/auth-context";
import { getVerificationRoute } from "@/src/services/auth/use-verification-routing";
import { useRouter } from "expo-router";
import { useContext, useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { user, isLoaded, verificationStatus, isVerificationLoaded } =
    useContext(AuthContext);
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Don't navigate until auth state is fully loaded
    if (!isLoaded || !isVerificationLoaded) {
      console.log("[Index] Waiting for auth to load...", {
        isLoaded,
        isVerificationLoaded,
      });
      return;
    }

    // Only navigate once
    if (hasNavigated.current) {
      console.log("[Index] Already navigated, skipping");
      return;
    }

    console.log("[Index] Auth loaded, determining route...", {
      hasUser: !!user,
      verificationStep: user?.verificationStep,
    });

    // Determine where user should go
    const targetRoute = getVerificationRoute(user, verificationStatus);
    console.log("[Index] Target route:", targetRoute);
    console.log("[Index] Navigating to:", targetRoute);
    hasNavigated.current = true;

    // Use replace to prevent back navigation to loading screen
    router.replace(targetRoute as any);
  }, [isLoaded, isVerificationLoaded, user, verificationStatus, router]);

  // Show loading screen while determining where to go
  return (
    <View style={styles.container}>
      <VStack space="lg" className="items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-lg text-typography-500 font-outfit">
          Loading...
        </Text>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFEFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
