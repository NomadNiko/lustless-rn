import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { OTPInput } from "@/src/components/OTPInput";
import {
  useAuthInitiateLoginService,
  useAuthVerifyLoginService,
} from "@/src/services/api/services/auth";
import HTTP_CODES_ENUM from "@/src/services/api/types/http-codes";
import {
  AuthActionsContext,
  AuthTokensContext,
} from "@/src/services/auth/auth-context";
import { getVerificationRoute } from "@/src/services/auth/use-verification-routing";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    otp?: string;
  }>({});

  const initiateLogin = useAuthInitiateLoginService();
  const verifyLogin = useAuthVerifyLoginService();
  const { setTokensInfo } = useContext(AuthTokensContext);
  const { loadData } = useContext(AuthActionsContext);

  const handleSignIn = async () => {
    // Client-side validation
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await initiateLogin({ email, password });

      if (response.status === HTTP_CODES_ENUM.OK) {
        const { data } = response;

        if (data.skipOtp && data.loginData) {
          // Skip OTP, login directly with tokens
          console.log("Login successful without OTP, setting tokens...");
          setTokensInfo({
            token: data.loginData.token,
            refreshToken: data.loginData.refreshToken,
            tokenExpires: data.loginData.tokenExpires,
          });

          // Reload user data with new tokens
          console.log("Reloading user data...");
          const {
            user: loadedUser,
            verificationStatus: loadedVerificationStatus,
          } = await loadData();
          console.log("User data loaded:", loadedUser);

          // Check if user data was loaded successfully
          if (!loadedUser) {
            console.error("Failed to load user data after login");
            setErrors({
              email: "Failed to load account data. Please try again.",
            });
            return;
          }

          // Navigate to correct route based on verification status
          const route = getVerificationRoute(
            loadedUser,
            loadedVerificationStatus
          );
          console.log("Navigating to:", route);
          router.replace(route);
        } else {
          // Show OTP screen
          setShowOTP(true);
        }
      } else if ("data" in response && response.data?.message) {
        const message = Array.isArray(response.data.message)
          ? response.data.message[0]
          : response.data.message;
        setErrors({ email: message || "Login failed" });
      }
    } catch (error) {
      setErrors({ email: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await verifyLogin({ email, otpCode: otp });

      if (response.status === HTTP_CODES_ENUM.OK) {
        const { data } = response;
        console.log("OTP verification successful, setting tokens...");
        setTokensInfo({
          token: data.token,
          refreshToken: data.refreshToken,
          tokenExpires: data.tokenExpires,
        });

        // Reload user data with new tokens
        console.log("Reloading user data...");
        const {
          user: loadedUser,
          verificationStatus: loadedVerificationStatus,
        } = await loadData();
        console.log("User data loaded:", loadedUser);

        // Check if user data was loaded successfully
        if (!loadedUser) {
          console.error("Failed to load user data after OTP verification");
          setErrors({ otp: "Failed to load account data. Please try again." });
          return;
        }

        // Navigate to correct route based on verification status
        const route = getVerificationRoute(
          loadedUser,
          loadedVerificationStatus
        );
        console.log("Navigating to:", route);
        router.replace(route);
      } else if ("data" in response && response.data) {
        const data = response.data;
        if ("message" in data && data.message) {
          const message = Array.isArray(data.message)
            ? data.message[0]
            : data.message;
          setErrors({ otp: message || "Invalid OTP code" });
        }
      }
    } catch (error) {
      setErrors({ otp: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                source={require("@/assets/images/logo_dark.png")}
                alt="Lustless Logo"
                className="w-48 h-16"
                style={{ resizeMode: "contain" }}
              />
              <VStack space="xs" className="items-center">
                <Heading size="3xl" className="text-typography-900 font-ovo">
                  {!showOTP ? "Welcome Back" : "Enter Verification Code"}
                </Heading>
                <Text
                  size="lg"
                  className="text-center text-typography-500 font-outfit"
                >
                  {!showOTP
                    ? "Sign in to continue"
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
                          if (errors.email)
                            setErrors({ ...errors, email: undefined });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </Input>
                    {errors.email && (
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.email}
                        </FormControlErrorText>
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
                        placeholder="Password"
                        value={password}
                        onChangeText={(text) => {
                          setPassword(text);
                          if (errors.password)
                            setErrors({ ...errors, password: undefined });
                        }}
                        type={showPassword ? "text" : "password"}
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
                        <FormControlErrorText>
                          {errors.password}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  {/* Forgot Password */}
                  <Box className="items-end">
                    <Button variant="link" size="md">
                      <ButtonText className="font-outfit">
                        Forgot Password?
                      </ButtonText>
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
                        if (errors.otp)
                          setErrors({ ...errors, otp: undefined });
                      }}
                      isInvalid={!!errors.otp}
                    />
                    {errors.otp && (
                      <FormControlError>
                        <FormControlErrorText>
                          {errors.otp}
                        </FormControlErrorText>
                      </FormControlError>
                    )}
                  </FormControl>

                  {/* Resend Button */}
                  <VStack space="xs" className="items-center">
                    <Text size="md" className="text-typography-500 font-outfit">
                      Didn{""}t receive the code?
                    </Text>
                    <Button variant="link" size="md">
                      <ButtonText className="font-outfit-medium">
                        Resend Code
                      </ButtonText>
                    </Button>
                  </VStack>
                </VStack>
              )}
            </VStack>

            {/* Action Buttons */}
            <VStack space="md">
              {!showOTP ? (
                <>
                  <Button
                    size="xl"
                    onPress={handleSignIn}
                    className="w-full"
                    isDisabled={loading}
                  >
                    <ButtonText className="font-outfit-semibold">
                      {loading ? "Signing In..." : "Sign In"}
                    </ButtonText>
                  </Button>

                  <Text
                    size="md"
                    className="text-center text-typography-500 font-outfit"
                  >
                    Don&apos;t have an account?{" "}
                    <Text
                      className="text-primary-500 font-outfit-semibold"
                      onPress={() => router.push("/(auth)/sign-up/step1")}
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
                    isDisabled={otp.length !== 6 || loading}
                    className="w-full"
                  >
                    <ButtonText className="font-outfit-semibold">
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </ButtonText>
                  </Button>

                  <Button
                    variant="outline"
                    size="xl"
                    onPress={() => {
                      setShowOTP(false);
                      setOtp("");
                      setErrors({});
                    }}
                    action="secondary"
                    className="w-full"
                  >
                    <ButtonText className="font-outfit-semibold">
                      Back to Sign In
                    </ButtonText>
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
