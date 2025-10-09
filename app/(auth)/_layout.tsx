import { useContext, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthContext } from '@/src/services/auth/auth-context';
import { getVerificationRoute } from '@/src/services/auth/use-verification-routing';

export default function AuthLayout() {
  const router = useRouter();
  const { user, isLoaded, verificationStatus, isVerificationLoaded } = useContext(AuthContext);

  useEffect(() => {
    // Only check after auth is loaded
    if (!isLoaded || !isVerificationLoaded) return;

    // If user is logged in, redirect them to the correct place
    if (user) {
      const correctRoute = getVerificationRoute(user, verificationStatus);
      console.log('[AuthLayout] User is logged in, redirecting to:', correctRoute);
      router.replace(correctRoute as any);
    }
  }, [user, isLoaded, verificationStatus, isVerificationLoaded, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
