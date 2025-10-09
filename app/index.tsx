import { useContext, useEffect, useState } from "react";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { AuthContext } from "@/src/services/auth/auth-context";
import { getVerificationRoute } from "@/src/services/auth/use-verification-routing";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function Index() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoaded, verificationStatus, isVerificationLoaded } = useContext(AuthContext);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Don't navigate until auth state is fully loaded
    if (!isLoaded || !isVerificationLoaded) {
      console.log('[Index] Waiting for auth to load...', { isLoaded, isVerificationLoaded });
      return;
    }

    // Only navigate once
    if (hasNavigated) {
      console.log('[Index] Already navigated, skipping');
      return;
    }

    console.log('[Index] Auth loaded, determining route...', {
      hasUser: !!user,
      verificationStep: user?.verificationStep,
      currentSegments: segments,
    });

    // Determine where user should go
    const targetRoute = getVerificationRoute(user, verificationStatus);
    console.log('[Index] Target route:', targetRoute);

    // Only navigate if we're still on the index screen
    const currentPath = `/${segments.join('/')}`;
    if (currentPath === '/' || currentPath === '') {
      console.log('[Index] Navigating to:', targetRoute);
      setHasNavigated(true);

      // Use replace to prevent back navigation to loading screen
      router.replace(targetRoute as any);
    } else {
      console.log('[Index] Already navigated away from index, current path:', currentPath);
    }
  }, [isLoaded, isVerificationLoaded, user, verificationStatus, hasNavigated, segments, router]);

  // Show loading screen while determining where to go
  return (
    <View style={styles.container}>
      <VStack space="lg" className="items-center">
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text className="text-typography-500 font-outfit text-lg">
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
