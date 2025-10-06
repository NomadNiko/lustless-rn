import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Checkbox, CheckboxIndicator, CheckboxIcon, CheckboxLabel } from '@/components/ui/checkbox';
import { FormControl, FormControlError, FormControlErrorText } from '@/components/ui/form-control';
import { EyeIcon, EyeOffIcon } from '@/components/ui/icon';
import { CheckIcon } from '@/components/ui/icon';

export default function Step1Screen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Mock validation
  const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string }>({});

  const handleContinue = () => {
    // Mock validation
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'You must agree to the terms';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and proceed
    setErrors({});
    router.push('/(auth)/sign-up/step2');
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
          {/* Header */}
          <VStack space="sm">
            <Heading size="2xl" className="text-typography-900 font-ovo">
              Create Your Account
            </Heading>
            <Text size="md" className="text-typography-500 font-outfit">
              Enter your email and choose a secure password to get started
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="lg" className="flex-1">
            {/* Email Input */}
            <FormControl isInvalid={!!errors.email}>
              <Input
                size="lg"
                variant="outline"
                isInvalid={!!errors.email}
              >
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
              <Input
                size="lg"
                variant="outline"
                isInvalid={!!errors.password}
              >
                <InputField
                  placeholder="Password (min 6 characters)"
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

            {/* Terms Checkbox */}
            <FormControl isInvalid={!!errors.terms}>
              <Checkbox
                value="terms"
                isChecked={agreedToTerms}
                onChange={setAgreedToTerms}
                size="lg"
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={CheckIcon} />
                </CheckboxIndicator>
                <CheckboxLabel className="text-md font-outfit">
                  I agree to the{' '}
                  <Text className="text-primary-500 font-outfit-semibold">Terms of Service</Text>
                  {' '}and{' '}
                  <Text className="text-primary-500 font-outfit-semibold">Privacy Policy</Text>
                </CheckboxLabel>
              </Checkbox>
              {errors.terms && (
                <FormControlError>
                  <FormControlErrorText>{errors.terms}</FormControlErrorText>
                </FormControlError>
              )}
            </FormControl>
          </VStack>

          {/* Continue Button */}
          <Button
            size="xl"
            onPress={handleContinue}
            className="w-full"
          >
            <ButtonText className="font-outfit-semibold">Continue</ButtonText>
          </Button>

          {/* Sign In Link */}
          <Text size="md" className="text-center text-typography-500 font-outfit">
            Already have an account?{' '}
            <Text
              className="text-primary-500 font-outfit-semibold"
              onPress={() => router.push('/(auth)/sign-in')}
            >
              Sign In
            </Text>
          </Text>
        </VStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
