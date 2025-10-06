import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { InfoIcon } from '@/components/ui/icon';
import { OTPInput } from '@/src/components/OTPInput';

export default function Step4Screen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');

  // Mock countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOTP = () => {
    // Mock validation
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Mock: In real app, call API to send OTP
    setError('');
    setShowOTP(true);
    setResendTimer(60);
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    // Mock: In real app, call API to verify OTP
    // On success, redirect to main app
    router.replace('/(tabs)');
  };

  const handleResendOTP = () => {
    if (resendTimer > 0) return;

    // Mock: In real app, call API to resend OTP
    setOtp('');
    setResendTimer(60);
    setError('');
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      return !match[2]
        ? match[1]
        : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
    }
    return text;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <VStack className="flex-1 px-6 py-8" space="xl">
          {/* Navigation Buttons */}
          <HStack space="md" className="w-full">
            <Button
              variant="outline"
              size="lg"
              onPress={() => {
                if (showOTP) {
                  setShowOTP(false);
                  setOtp('');
                  setError('');
                } else {
                  router.back();
                }
              }}
              action="secondary"
              className="flex-1"
            >
              <ButtonText className="font-outfit-semibold">
                {showOTP ? 'Change Phone' : 'Back'}
              </ButtonText>
            </Button>
            <Button
              size="lg"
              onPress={showOTP ? handleVerifyOTP : handleSendOTP}
              isDisabled={showOTP && otp.length !== 6}
              className="flex-1"
            >
              <ButtonText className="font-outfit-semibold">
                {showOTP ? 'Verify' : 'Send Code'}
              </ButtonText>
            </Button>
          </HStack>

          {/* Header */}
          <VStack space="sm">
            <Heading size="2xl" className="text-typography-900 font-ovo">
              Verify Your Phone
            </Heading>
            <Text size="md" className="text-typography-500 font-outfit">
              {!showOTP
                ? 'We\'ll send you a verification code'
                : `Enter the 6-digit code sent to ${phoneNumber}`}
            </Text>
          </VStack>

          {/* Info Alert */}
          <Alert action="info" variant="outline">
            <AlertIcon as={InfoIcon} />
            <AlertText className="flex-1">
              This helps us keep Lustless safe and ensures you&apos;re a real person.
            </AlertText>
          </Alert>

          {/* Form */}
          <VStack space="lg" className="flex-1">
            {!showOTP ? (
              /* Phone Number Input */
              <FormControl isInvalid={!!error}>
                <Input size="lg" variant="outline" isInvalid={!!error}>
                  <InputField
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(formatPhoneNumber(text));
                      if (error) setError('');
                    }}
                    keyboardType="phone-pad"
                    maxLength={14}
                  />
                </Input>
                {error && (
                  <FormControlError>
                    <FormControlErrorText>{error}</FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            ) : (
              /* OTP Input */
              <VStack space="md">
                <FormControl isInvalid={!!error}>
                  <OTPInput
                    length={6}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      if (error) setError('');
                    }}
                    isInvalid={!!error}
                  />
                  {error && (
                    <FormControlError>
                      <FormControlErrorText>{error}</FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Resend Button */}
                <VStack space="xs" className="items-center">
                  <Text size="md" className="text-typography-500 font-outfit">
                    Didn&apos;t receive the code?
                  </Text>
                  {resendTimer > 0 ? (
                    <Text size="md" className="text-typography-400 font-outfit">
                      Resend in {resendTimer}s
                    </Text>
                  ) : (
                    <Button
                      variant="link"
                      size="md"
                      onPress={handleResendOTP}
                    >
                      <ButtonText className="font-outfit-medium">Resend Code</ButtonText>
                    </Button>
                  )}
                </VStack>
              </VStack>
            )}
          </VStack>

        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
