import { useRouter } from 'expo-router';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Image } from '@/components/ui/image';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VStack className="flex-1 bg-background-0">
        {/* Hero Section */}
        <VStack className="flex-1 px-6 py-12 justify-center" space="2xl">
          {/* Logo/Brand */}
          <VStack space="lg" className="items-center">
            <Image
              source={require('@/assets/images/logo_dark.png')}
              alt="Lustless Logo"
              className="w-48 h-16"
              contentFit="contain"
            />
            <Text size="xl" className="text-typography-500 text-center font-outfit">
              Dating beyond the surface
            </Text>
          </VStack>

          {/* Value Propositions */}
          <VStack space="lg" className="mt-8">
            <Box className="px-4">
              <VStack space="xs">
                <Heading size="lg" className="text-typography-900 font-ovo">
                  ✨ Verified Identity
                </Heading>
                <Text size="lg" className="text-typography-600 font-outfit">
                  Selfie and ID verification ensures every user is real and authentic
                </Text>
              </VStack>
            </Box>

            <Box className="px-4">
              <VStack space="xs">
                <Heading size="lg" className="text-typography-900 font-ovo">
                  💬 Conversation First
                </Heading>
                <Text size="lg" className="text-typography-600 font-outfit">
                  Connect through conversation - photos revealed only when you meet
                </Text>
              </VStack>
            </Box>

            <Box className="px-4">
              <VStack space="xs">
                <Heading size="lg" className="text-typography-900 font-ovo">
                  🔒 Zero Tolerance
                </Heading>
                <Text size="lg" className="text-typography-600 font-outfit">
                  No bots, no catfishing, no fake profiles - just genuine people
                </Text>
              </VStack>
            </Box>
          </VStack>
        </VStack>

        {/* Action Buttons */}
        <VStack space="md" className="px-6 pb-8">
          <Button
            size="xl"
            onPress={() => router.push('/(auth)/sign-up/step1')}
            className="w-full"
          >
            <ButtonText className="font-outfit-semibold">Create Account</ButtonText>
          </Button>

          <Button
            variant="outline"
            size="xl"
            onPress={() => router.push('/(auth)/sign-in')}
            action="secondary"
            className="w-full"
          >
            <ButtonText className="font-outfit-semibold">Sign In</ButtonText>
          </Button>

          <Text size="sm" className="text-typography-400 text-center px-8 font-outfit">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
