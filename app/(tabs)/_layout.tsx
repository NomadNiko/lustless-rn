import { Tabs, useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { AuthContext } from "@/src/services/auth/auth-context";
import { getVerificationRoute } from "@/src/services/auth/use-verification-routing";

export default function TabLayout() {
  const router = useRouter();
  const { user, isLoaded, verificationStatus, isVerificationLoaded } = useContext(AuthContext);

  useEffect(() => {
    // Only check after auth is loaded
    if (!isLoaded || !isVerificationLoaded) return;

    // If no user, redirect to auth
    if (!user) {
      console.log('[TabsLayout] No user found, redirecting to auth');
      router.replace('/(auth)');
      return;
    }

    // If user exists but not fully verified, redirect to correct signup step
    if (!verificationStatus?.isFullyVerified) {
      const correctRoute = getVerificationRoute(user, verificationStatus);
      console.log('[TabsLayout] User not fully verified, redirecting to:', correctRoute);
      router.replace(correctRoute as any);
    }
  }, [user, isLoaded, verificationStatus, isVerificationLoaded, router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
