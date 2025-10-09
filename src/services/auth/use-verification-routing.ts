import { useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { AuthContext } from './auth-context';

/**
 * Hook to handle verification-based routing
 * Redirects users to the correct onboarding step based on their verification status
 */
export function useVerificationRouting(options?: { enabled?: boolean }) {
  const { user, isLoaded, verificationStatus, isVerificationLoaded } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled || !isLoaded || !isVerificationLoaded) return;

    // Skip if we're already on an auth screen (prevent loops)
    if (pathname?.startsWith('/(auth)')) return;

    // If no user, redirect to auth
    if (!user) {
      router.replace('/(auth)');
      return;
    }

    // Check if user is fully verified
    const isFullyVerified =
      user.verificationStep === 'fully_verified' ||
      verificationStatus?.isFullyVerified;

    if (isFullyVerified) {
      // User is fully verified, allow access to app
      return;
    }

    // User is not fully verified, redirect to correct step
    const currentStep = user.verificationStep || verificationStatus?.currentStep;

    switch (currentStep) {
      case 'email_verified':
        // Need to complete identity verification (steps 2 & 3)
        router.replace('/(auth)/sign-up/step2');
        break;
      case 'identity_verified':
        // Need to complete phone verification (step 4)
        router.replace('/(auth)/sign-up/step4');
        break;
      default:
        // Unknown state, start from beginning
        router.replace('/(auth)/sign-up/step1');
    }
  }, [user, isLoaded, verificationStatus, isVerificationLoaded, pathname, router, enabled]);
}

/**
 * Get the correct route for a user based on their verification status
 */
export function getVerificationRoute(
  user: any,
  verificationStatus: any
) {
  if (!user) {
    return '/(auth)' as const;
  }

  const isFullyVerified =
    user.verificationStep === 'fully_verified' ||
    verificationStatus?.isFullyVerified;

  if (isFullyVerified) {
    return '/(tabs)' as const;
  }

  const currentStep = user.verificationStep || verificationStatus?.currentStep;

  console.log('getVerificationRoute - currentStep:', currentStep);
  console.log('getVerificationRoute - user.verificationStep:', user.verificationStep);

  switch (currentStep) {
    case 'email_verified':
      console.log('Routing to step2 for ID verification');
      return '/(auth)/sign-up/step2' as const;
    case 'identity_verified':
      console.log('Routing to step4 for phone verification');
      return '/(auth)/sign-up/step4' as const;
    default:
      console.log('Routing to step1 (default)');
      return '/(auth)/sign-up/step1' as const;
  }
}
