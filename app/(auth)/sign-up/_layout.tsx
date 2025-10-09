import { Stack, usePathname } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Image } from '@/components/ui/image';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpLayout() {
  const pathname = usePathname();

  // Determine current step from pathname
  const getCurrentStep = () => {
    if (pathname.includes('step1')) return 1;
    if (pathname.includes('step2')) return 2;
    if (pathname.includes('step3')) return 3;
    if (pathname.includes('step4')) return 4;
    return 1;
  };

  const currentStep = getCurrentStep();
  const totalSteps = 4;

  const steps = [
    { number: 1, label: 'Account' },
    { number: 2, label: 'ID Photo' },
    { number: 3, label: 'Selfie' },
    { number: 4, label: 'Phone' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <VStack className="flex-1 bg-background-0">
        {/* Progress Header */}
        <Box className="px-6 pt-4 pb-3">
          {/* Brand */}
          <Box className="items-center mb-4">
            <Image
              source={require('@/assets/images/logo_dark.png')}
              alt="Lustless Logo"
              className="w-32 h-10"
              style={{ resizeMode: 'contain' }}
            />
          </Box>

          {/* Progress Bar */}
          <VStack space="sm">
            <HStack space="xs" className="mb-1">
              {steps.map((step) => (
                <Box
                  key={step.number}
                  className={`flex-1 h-1 rounded-full ${
                    step.number <= currentStep
                      ? 'bg-primary-500'
                      : 'bg-background-200'
                  }`}
                />
              ))}
            </HStack>

            {/* Step Labels */}
            <HStack className="justify-between">
              {steps.map((step) => (
                <VStack key={step.number} className="items-center" space="xs">
                  <Box
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      step.number === currentStep
                        ? 'bg-primary-500'
                        : step.number < currentStep
                        ? 'bg-primary-300'
                        : 'bg-background-200'
                    }`}
                  >
                    <Text
                      size="xs"
                      className={`font-semibold ${
                        step.number <= currentStep
                          ? 'text-typography-0'
                          : 'text-typography-500'
                      }`}
                    >
                      {step.number}
                    </Text>
                  </Box>
                  <Text
                    size="xs"
                    className={`font-outfit ${
                      step.number === currentStep
                        ? 'text-typography-900 font-outfit-semibold'
                        : 'text-typography-500'
                    }`}
                  >
                    {step.label}
                  </Text>
                </VStack>
              ))}
            </HStack>
          </VStack>
        </Box>

        {/* Screen Content */}
        <Box className="flex-1">
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="step1" />
            <Stack.Screen name="step2" />
            <Stack.Screen name="step3" />
            <Stack.Screen name="step4" />
          </Stack>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}
