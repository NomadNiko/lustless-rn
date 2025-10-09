import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { CheckCircleIcon, Icon, InfoIcon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthIdentityVerifyService } from "@/src/services/api/services/auth";
import { useFilesUploadService } from "@/src/services/api/services/files";
import HTTP_CODES_ENUM from "@/src/services/api/types/http-codes";
import { AuthActionsContext } from "@/src/services/auth/auth-context";
import { getOnboardingData } from "@/src/services/auth/onboarding-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, X } from "lucide-react-native";
import { useContext, useEffect, useRef, useState } from "react";
import { Dimensions, ScrollView, TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");
const CIRCLE_SIZE = width * 0.7;

export default function Step3Screen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraRef = useRef<any>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<{
    similarity?: number;
    extractedFirstName?: string;
    extractedLastName?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const uploadFile = useFilesUploadService();
  const verifyIdentity = useAuthIdentityVerifyService();
  const { refreshVerificationStatus, loadData } =
    useContext(AuthActionsContext);

  // Load onboarding data on mount
  useEffect(() => {
    const loadOnboardingData = async () => {
      const data = await getOnboardingData();
      console.log("Step3 loaded onboarding data:", data);
      console.log("Step3 params:", params);
    };
    loadOnboardingData();
  }, [params]);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      // Close camera and show loading state immediately
      setShowCamera(false);
      setIsVerifying(true);
      setError(null);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      // Calculate crop dimensions to match the circular overlay
      const photoWidth = photo.width;
      const photoHeight = photo.height;

      // Calculate the circle size as percentage of photo width
      const circlePercent = 0.7;
      const cropSize = photoWidth * circlePercent;

      // Center the crop horizontally, move up 100px vertically
      const originX = (photoWidth - cropSize) / 2;
      const originY = (photoHeight - cropSize) / 2 - 100;

      const croppedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX,
              originY,
              width: cropSize,
              height: cropSize,
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setSelfieImage(croppedPhoto.uri);
      setVerificationProgress(25);

      try {
        // Get ID document ID from storage (more reliable than params)
        const onboardingData = await getOnboardingData();
        const idDocumentId = onboardingData?.idDocumentId;

        console.log("Starting selfie verification...");
        console.log("Onboarding data:", onboardingData);
        console.log("idDocumentId:", idDocumentId);

        if (!idDocumentId) {
          console.error("ID document not found in storage");
          setError(
            "ID document not found. Please go back and retake your ID photo."
          );
          setIsVerifying(false);
          setSelfieImage(null);
          setVerificationProgress(0);
          return;
        }

        // Upload selfie
        const formData = new FormData();
        const filename = croppedPhoto.uri.split("/").pop() || "selfie.jpg";

        formData.append("file", {
          uri: croppedPhoto.uri,
          name: filename,
          type: "image/jpeg",
        } as any);

        console.log("Uploading selfie...");
        setVerificationProgress(50);

        const uploadResponse = await uploadFile(formData);

        console.log("Upload response status:", uploadResponse.status);
        console.log("Upload response:", uploadResponse);

        if (
          uploadResponse.status !== HTTP_CODES_ENUM.OK &&
          uploadResponse.status !== HTTP_CODES_ENUM.CREATED
        ) {
          console.error("Upload failed with status:", uploadResponse.status);
          throw new Error("Failed to upload selfie");
        }

        const selfieId = uploadResponse.data.file.id;
        console.log("Selfie uploaded, ID:", selfieId);
        setVerificationProgress(75);

        // Call identity verify API
        console.log("Calling identity verify API...");
        const verifyResponse = await verifyIdentity({ idDocumentId, selfieId });

        console.log("Verify response status:", verifyResponse.status);
        console.log("Verify response:", verifyResponse);

        if (verifyResponse.status === HTTP_CODES_ENUM.OK) {
          const { data } = verifyResponse;

          // Check if verification was actually successful
          if (data.success === true) {
            console.log("Verification successful:", data);
            setVerificationResult({
              similarity: data.similarity,
              extractedFirstName: data.extractedFirstName,
              extractedLastName: data.extractedLastName,
            });
            setVerificationProgress(100);
            setIsVerifying(false);

            // Reload user data to get updated verificationStep from backend
            await loadData();
          } else {
            // Verification failed (face comparison or missing ID data)
            console.error("Verification rejected:", data.message);
            setError(
              data.message ||
                "Identity verification failed. Please try again with a clearer photo."
            );
            setIsVerifying(false);
            setSelfieImage(null);
            setVerificationProgress(0);
          }
        } else if (
          verifyResponse.status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY
        ) {
          // Handle 422 errors (validation, max attempts, etc.)
          const errors = verifyResponse.data?.errors;
          let errorMessage = "Identity verification failed";

          const verificationError = Array.isArray(errors?.verification)
            ? errors.verification[0]
            : errors?.verification;
          const filesError = Array.isArray(errors?.files)
            ? errors.files[0]
            : errors?.files;

          if (verificationError === "maxAttemptsReached") {
            errorMessage =
              "Maximum verification attempts reached. Please contact support.";
          } else if (verificationError === "invalidVerificationStep") {
            errorMessage =
              "Invalid verification step. Please complete email verification first.";
          } else if (filesError === "filesNotFound") {
            errorMessage =
              "Uploaded files not found. Please upload your ID again.";
            // Redirect back to step2
            router.replace("/(auth)/sign-up/step2");
            return;
          } else if (
            verificationError?.startsWith("identityVerificationFailed")
          ) {
            errorMessage = verificationError.replace(
              "identityVerificationFailed: ",
              ""
            );
          } else if (verifyResponse.data?.message) {
            const message = Array.isArray(verifyResponse.data.message)
              ? verifyResponse.data.message[0]
              : verifyResponse.data.message;
            errorMessage = message;
          }

          console.error("Verification failed with 422:", errorMessage);
          setError(errorMessage);
          setIsVerifying(false);
          setSelfieImage(null);
          setVerificationProgress(0);
        } else if ("data" in verifyResponse && verifyResponse.data?.message) {
          const message = Array.isArray(verifyResponse.data.message)
            ? verifyResponse.data.message[0]
            : verifyResponse.data.message;
          console.error("Verification failed:", message);
          setError(message || "Identity verification failed");
          setIsVerifying(false);
          setSelfieImage(null);
          setVerificationProgress(0);
        } else {
          console.error("Unexpected verify response:", verifyResponse);
          throw new Error("Unexpected response from server");
        }
      } catch (error) {
        console.error("Verification error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Verification failed. Please try again.";
        setError(errorMessage);
        setIsVerifying(false);
        setSelfieImage(null);
        setVerificationProgress(0);
      }
    }
  };

  const handleContinue = () => {
    if (!selfieImage || isVerifying) return;
    router.push("/(auth)/sign-up/step4");
  };

  if (showCamera) {
    return (
      <Box className="flex-1 bg-background-0">
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
        <VStack
          className="absolute inset-0 justify-between p-6"
          style={{ pointerEvents: "box-none" }}
        >
          {/* Close Button */}
          <Box className="items-end" style={{ pointerEvents: "auto" }}>
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Box className="items-center justify-center w-12 h-12 rounded-full bg-background-900/80">
                <Icon as={X} className="text-typography-0" />
              </Box>
            </TouchableOpacity>
          </Box>

          {/* Face Guide Overlay - Larger circle */}
          <Box
            className="items-center justify-center flex-1"
            style={{ pointerEvents: "none" }}
          >
            <Box
              className="border-4 border-dashed rounded-full border-primary-500"
              style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
            />
            <Card className="p-3 mt-4 bg-background-900/80">
              <Text className="text-center text-typography-0 font-outfit">
                Position your face within the circle
              </Text>
            </Card>
          </Box>

          {/* Capture Button */}
          <Box className="items-center pb-8" style={{ pointerEvents: "auto" }}>
            <TouchableOpacity onPress={handleCapture}>
              <Box className="items-center justify-center w-20 h-20 border-4 rounded-full bg-primary-500 border-background-0">
                <Icon as={Camera} size="xl" className="text-typography-0" />
              </Box>
            </TouchableOpacity>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
      <VStack className="flex-1 px-6 py-8" space="xl">
        {/* Navigation Buttons */}
        <HStack space="md" className="w-full">
          <Button
            variant="outline"
            size="lg"
            onPress={() => router.back()}
            action="secondary"
            className="flex-1"
            isDisabled={isVerifying}
          >
            <ButtonText className="font-outfit-semibold">Back</ButtonText>
          </Button>
          <Button
            size="lg"
            onPress={handleContinue}
            isDisabled={!selfieImage || isVerifying}
            className="flex-1"
          >
            <ButtonText className="font-outfit-semibold">Continue</ButtonText>
          </Button>
        </HStack>

        {/* Header */}
        <VStack space="sm">
          <Heading size="2xl" className="text-typography-900 font-ovo">
            Take a Selfie
          </Heading>
          <Text size="md" className="text-typography-500 font-outfit">
            We&apos;ll compare this with your ID to verify your identity
          </Text>
        </VStack>

        {/* Info Alert */}
        <Alert action="info" variant="outline">
          <AlertIcon as={InfoIcon} />
          <AlertText className="flex-1 font-outfit">
            Make sure your face is clearly visible and well-lit. Look directly
            at the camera.
          </AlertText>
        </Alert>

        {/* Error Display */}
        {error && (
          <VStack space="md">
            <Alert action="error" variant="solid">
              <AlertIcon as={InfoIcon} />
              <AlertText className="flex-1 font-outfit">{error}</AlertText>
            </Alert>
            <Button
              variant="outline"
              size="lg"
              onPress={() => router.replace("/(auth)/sign-up/step2")}
              action="secondary"
              className="w-full"
            >
              <ButtonText className="font-outfit-semibold">
                Re-upload ID Document
              </ButtonText>
            </Button>
          </VStack>
        )}

        {/* Selfie Capture Area */}
        <VStack space="md" className="items-center justify-center flex-1">
          {!selfieImage ? (
            <>
              {/* Camera Preview Placeholder - Larger */}
              <Box
                className="items-center justify-center mb-6 border-4 border-dashed rounded-full bg-background-100 border-background-300"
                style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
              >
                <VStack space="md" className="items-center">
                  <Icon
                    as={Camera}
                    size="2xl"
                    className="text-background-400"
                  />
                  <Text size="md" className="text-typography-500 font-outfit">
                    Position your face
                  </Text>
                </VStack>
              </Box>

              {/* Capture Button */}
              <TouchableOpacity onPress={handleOpenCamera}>
                <Box className="items-center justify-center w-20 h-20 border-4 rounded-full shadow-lg bg-primary-500 border-background-0">
                  <Icon as={Camera} size="xl" className="text-typography-0" />
                </Box>
              </TouchableOpacity>
            </>
          ) : (
            /* Photo Preview with Loading State */
            <VStack space="lg" className="w-full">
              {/* Selfie Preview */}
              <Box className="items-center w-full">
                <Box
                  className="items-center justify-center border-4 rounded-full"
                  style={{
                    width: CIRCLE_SIZE,
                    height: CIRCLE_SIZE,
                    borderColor: isVerifying ? "#ffffff" : "#8b5cf6",
                    backgroundColor: "#000000",
                  }}
                >
                  {isVerifying ? (
                    <VStack space="md" className="items-center">
                      <Icon
                        as={Camera}
                        size="2xl"
                        className="text-typography-0"
                      />
                      <Progress
                        value={verificationProgress}
                        size="md"
                        className="w-3/4"
                      >
                        <ProgressFilledTrack />
                      </Progress>
                      <Text size="xs" className="text-typography-0 font-outfit">
                        {verificationProgress}%
                      </Text>
                    </VStack>
                  ) : (
                    <Box className="w-full h-full overflow-hidden rounded-full">
                      <Image
                        source={{ uri: selfieImage }}
                        alt="Selfie"
                        className="w-full h-full"
                        style={{ resizeMode: "cover" }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Success Message */}
              {!isVerifying && (
                <VStack space="xs" className="items-center">
                  <HStack space="sm" className="items-center">
                    <Icon
                      as={CheckCircleIcon}
                      size="lg"
                      className="text-success-600"
                    />
                    <Text
                      size="xl"
                      className="font-outfit-semibold text-success-900"
                    >
                      Identity Verified!
                    </Text>
                  </HStack>
                  {verificationResult && (
                    <VStack space="xs" className="items-center">
                      {verificationResult.similarity && (
                        <Text
                          size="md"
                          className="text-center text-typography-600 font-outfit"
                        >
                          Match Score:{" "}
                          {verificationResult.similarity.toFixed(1)}%
                        </Text>
                      )}
                      {(verificationResult.extractedFirstName ||
                        verificationResult.extractedLastName) && (
                        <Text
                          size="md"
                          className="text-center text-typography-600 font-outfit"
                        >
                          Name: {verificationResult.extractedFirstName}{" "}
                          {verificationResult.extractedLastName}
                        </Text>
                      )}
                      <Text
                        size="lg"
                        className="text-center text-typography-600 font-outfit"
                      >
                        Your face matches your ID. You're all set!
                      </Text>
                    </VStack>
                  )}
                  <Button
                    variant="link"
                    size="md"
                    onPress={() => {
                      setSelfieImage(null);
                      setVerificationProgress(0);
                    }}
                    action="secondary"
                  >
                    <ButtonText className="font-outfit-medium">
                      Retake Photo
                    </ButtonText>
                  </Button>
                </VStack>
              )}
            </VStack>
          )}
        </VStack>

        {/* Tips */}
        {!selfieImage && (
          <Card variant="ghost" className="p-4">
            <VStack space="sm">
              <Text
                size="lg"
                className="font-outfit-semibold text-typography-900"
              >
                Selfie Tips:
              </Text>
              <VStack space="xs">
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">
                    •
                  </Text>
                  <Text
                    size="md"
                    className="flex-1 text-typography-600 font-outfit"
                  >
                    Remove glasses and hats
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">
                    •
                  </Text>
                  <Text
                    size="md"
                    className="flex-1 text-typography-600 font-outfit"
                  >
                    Make sure your face is well-lit
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">
                    •
                  </Text>
                  <Text
                    size="md"
                    className="flex-1 text-typography-600 font-outfit"
                  >
                    Look directly at the camera with a neutral expression
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Card>
        )}
      </VStack>
    </ScrollView>
  );
}
 