import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { OTPInput } from '@/src/components/OTPInput';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; otp?: string }>({});

  const handleSignIn = () => {
    // Mock validation
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Mock: In real app, call initiateLogin API
    // If user is fully verified, show OTP screen
    setErrors({});
    setShowOTP(true);
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }

    // Mock: In real app, call verifyLogin API
    // On success, navigate to main app
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          className="flex-1 bg-background-0"
        >
          <VStack className="flex-1 px-6 py-12" space="xl">
            {/* Header */}
            <VStack space="lg" className="items-center">
              <Image
                source={require('@/assets/images/logo_dark.png')}
                alt="Lustless Logo"
                className="w-48 h-16"
                contentFit="contain"
              />
              <VStack space="xs" className="items-center">
                <Heading size="3xl" className="text-typography-900 font-ovo">
                  {!showOTP ? 'Welcome Back' : 'Enter Verification Code'}
                </Heading>
                <Text size="lg" className="text-typography-500 text-center font-outfit">
                  {!showOTP
                    ? 'Sign in to continue'
                    : `We sent a 6-digit code to ${email}`}
                </Text>
              </VStack>
            </VStack>

            {/* Form */}
            <VStack space="lg" className="flex-1">
              {!showOTP ? (
                <>
                  {/* Email Input */}
                  <FormControl isInvalid={!!errors.email}>
                    <Input size="lg" variant="outline" isInvalid={!!errors.email}>
                      <InputField
                        placeholder="Email address"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </Input>
                    {errors.email && (
                      <FormControlError>
                        <FormControlErrorText>{errors.email}</FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  {/* Password Input */}
                  <FormControl isInvalid={!!errors.password}>
                    <Input size="lg" variant="outline" isInvalid={!!errors.password}>
                      <InputField
                        placeholder="Password"
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        type={showPassword ? 'text' : 'password'}
                        autoCapitalize="none"
                        autoComplete="password"
                      />
                      <InputSlot
                        className="pr-3"
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                      </InputSlot>
                    </Input>
                    {errors.password && (
                      <FormControlError>
                        <FormControlErrorText>{errors.password}</FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  {/* Forgot Password */}
                  <Box className="items-end">
                    <Button variant="link" size="md">
                      <ButtonText className="font-outfit">Forgot Password?</ButtonText>
                    </Button>
                  </Box>
                </>
              ) : (
                /* OTP Input */
                <VStack space="md">
                  <FormControl isInvalid={!!errors.otp}>
                    <OTPInput
                      length={6}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        if (errors.otp) setErrors({ ...errors, otp: undefined });
                      }}
                      isInvalid={!!errors.otp}
                    />
                    {errors.otp && (
                      <FormControlError>
                        <FormControlErrorText>{errors.otp}</FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  {/* Resend Button */}
                  <VStack space="xs" className="items-center">
                    <Text size="md" className="text-typography-500 font-outfit">
                      Didn{''}t receive the code?
                    </Text>
                    <Button variant="link" size="md">
                      <ButtonText className="font-outfit-medium">Resend Code</ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              )}
            </VStack>

            {/* Action Buttons */}
            <VStack space="md">
              {!showOTP ? (
                <>
                  <Button size="xl" onPress={handleSignIn} className="w-full">
                    <ButtonText className="font-outfit-semibold">Sign In</ButtonText>
                  </Button>

                  <Text size="md" className="text-center text-typography-500 font-outfit">
                    Don&apos;t have an account?{' '}
                    <Text
                      className="text-primary-500 font-outfit-semibold"
                      onPress={() => router.push('/(auth)/sign-up/step1')}
                    >
                      Sign Up
                    </Text>
                  </Text>
                </>
              ) : (
                <>
                  <Button
                    size="xl"
                    onPress={handleVerifyOTP}
                    isDisabled={otp.length !== 6}
                    className="w-full"
                  >
                    <ButtonText className="font-outfit-semibold">Verify & Sign In</ButtonText>
                  </Button>

                  <Button
                    variant="outline"
                    size="xl"
                    onPress={() => {
                      setShowOTP(false);
                      setOtp('');
                      setErrors({});
                    }}
                    action="secondary"
                    className="w-full"
                  >
                    <ButtonText className="font-outfit-semibold">Back to Sign In</ButtonText>
                  </Button>
                </>
              )}
            </VStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
