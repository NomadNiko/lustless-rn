import { useState, useRef, useEffect, useContext } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useFilesUploadService } from '@/src/services/api/services/files';
import { useAuthIdentityVerifyService } from '@/src/services/api/services/auth';
import HTTP_CODES_ENUM from '@/src/services/api/types/http-codes';
import { getOnboardingData, setOnboardingData, clearOnboardingData } from '@/src/services/auth/onboarding-storage';
import { AuthActionsContext } from '@/src/services/auth/auth-context';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { CameraIcon, CheckCircleIcon, XIcon } from '@/components/ui/icon';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { InfoIcon } from '@/components/ui/icon';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { Image } from '@/components/ui/image';

const { width } = Dimensions.get('window');
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
  const { refreshVerificationStatus } = useContext(AuthActionsContext);

  // Load onboarding data on mount
  useEffect(() => {
    const loadData = async () => {
      const data = await getOnboardingData();
      console.log('Step3 loaded onboarding data:', data);
      console.log('Step3 params:', params);
    };
    loadData();
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
      const originY = ((photoHeight - cropSize) / 2) - 100;

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

        console.log('Starting selfie verification...');
        console.log('Onboarding data:', onboardingData);
        console.log('idDocumentId:', idDocumentId);

        if (!idDocumentId) {
          console.error('ID document not found in storage');
          setError('ID document not found. Please go back and retake your ID photo.');
          setIsVerifying(false);
          setSelfieImage(null);
          setVerificationProgress(0);
          return;
        }

        // Upload selfie
        const formData = new FormData();
        const filename = croppedPhoto.uri.split('/').pop() || 'selfie.jpg';

        formData.append('file', {
          uri: croppedPhoto.uri,
          name: filename,
          type: 'image/jpeg',
        } as any);

        console.log('Uploading selfie...');
        setVerificationProgress(50);

        const uploadResponse = await uploadFile(formData);

        console.log('Upload response status:', uploadResponse.status);
        console.log('Upload response:', uploadResponse);

        if (uploadResponse.status !== HTTP_CODES_ENUM.OK && uploadResponse.status !== HTTP_CODES_ENUM.CREATED) {
          console.error('Upload failed with status:', uploadResponse.status);
          throw new Error('Failed to upload selfie');
        }

        const selfieId = uploadResponse.data.file.id;
        console.log('Selfie uploaded, ID:', selfieId);
        setVerificationProgress(75);

        // Call identity verify API
        console.log('Calling identity verify API...');
        const verifyResponse = await verifyIdentity({ idDocumentId, selfieId });

        console.log('Verify response status:', verifyResponse.status);
        console.log('Verify response:', verifyResponse);

        if (verifyResponse.status === HTTP_CODES_ENUM.OK) {
          const { data } = verifyResponse;
          console.log('Verification successful:', data);
          setVerificationResult({
            similarity: data.similarity,
            extractedFirstName: data.extractedFirstName,
            extractedLastName: data.extractedLastName,
          });
          setVerificationProgress(100);
          setIsVerifying(false);

          // Refresh verification status to update user's verificationStep
          await refreshVerificationStatus();
        } else if ('data' in verifyResponse && verifyResponse.data?.message) {
          const message = Array.isArray(verifyResponse.data.message)
            ? verifyResponse.data.message[0]
            : verifyResponse.data.message;
          console.error('Verification failed:', message);
          setError(message || 'Identity verification failed');
          setIsVerifying(false);
        } else {
          console.error('Unexpected verify response:', verifyResponse);
          throw new Error('Unexpected response from server');
        }
      } catch (error) {
        console.error('Verification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Verification failed. Please try again.';
        setError(errorMessage);
        setIsVerifying(false);
        setSelfieImage(null);
        setVerificationProgress(0);
      }
    }
  };

  const handleContinue = () => {
    if (!selfieImage || isVerifying) return;
    router.push('/(auth)/sign-up/step4');
  };

  if (showCamera) {
    return (
      <Box className="flex-1 bg-background-0">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="front"
        />
        <VStack className="absolute inset-0 justify-between p-6" style={{ pointerEvents: 'box-none' }}>
          {/* Close Button */}
          <Box className="items-end" style={{ pointerEvents: 'auto' }}>
            <TouchableOpacity onPress={() => setShowCamera(false)}>
              <Box className="w-12 h-12 bg-background-900/80 rounded-full items-center justify-center">
                <Icon as={XIcon} className="text-typography-0" />
              </Box>
            </TouchableOpacity>
          </Box>

          {/* Face Guide Overlay - Larger circle */}
          <Box className="items-center flex-1 justify-center" style={{ pointerEvents: 'none' }}>
            <Box
              className="rounded-full border-4 border-primary-500 border-dashed"
              style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
            />
            <Card className="bg-background-900/80 p-3 mt-4">
              <Text className="text-typography-0 text-center font-outfit">
                Position your face within the circle
              </Text>
            </Card>
          </Box>

          {/* Capture Button */}
          <Box className="items-center pb-8" style={{ pointerEvents: 'auto' }}>
            <TouchableOpacity onPress={handleCapture}>
              <Box className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center border-4 border-background-0">
                <Icon as={CameraIcon} size="xl" className="text-typography-0" />
              </Box>
            </TouchableOpacity>
          </Box>
        </VStack>
      </Box>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      className="flex-1"
    >
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
            Make sure your face is clearly visible and well-lit. Look directly at the camera.
          </AlertText>
        </Alert>

        {/* Error Display */}
        {error && (
          <Alert action="error" variant="solid">
            <AlertIcon as={InfoIcon} />
            <AlertText className="flex-1 font-outfit">{error}</AlertText>
          </Alert>
        )}

        {/* Selfie Capture Area */}
        <VStack space="md" className="flex-1 items-center justify-center">
          {!selfieImage ? (
            <>
              {/* Camera Preview Placeholder - Larger */}
              <Box
                className="rounded-full bg-background-100 border-4 border-dashed border-background-300 items-center justify-center mb-6"
                style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
              >
                <VStack space="md" className="items-center">
                  <Icon as={CameraIcon} size="2xl" className="text-background-400" />
                  <Text size="md" className="text-typography-500 font-outfit">
                    Position your face
                  </Text>
                </VStack>
              </Box>

              {/* Capture Button */}
              <TouchableOpacity onPress={handleOpenCamera}>
                <Box className="w-20 h-20 rounded-full bg-primary-500 items-center justify-center border-4 border-background-0 shadow-lg">
                  <Icon as={CameraIcon} size="xl" className="text-typography-0" />
                </Box>
              </TouchableOpacity>
            </>
          ) : (
            /* Photo Preview with Loading State */
            <VStack space="lg" className="w-full">
              {/* Selfie Preview */}
              <Box className="w-full items-center">
                <Box
                  className="rounded-full border-4 items-center justify-center"
                  style={{
                    width: CIRCLE_SIZE,
                    height: CIRCLE_SIZE,
                    borderColor: isVerifying ? '#ffffff' : '#8b5cf6',
                    backgroundColor: '#000000',
                  }}
                >
                  {isVerifying ? (
                    <VStack space="md" className="items-center">
                      <Icon as={CameraIcon} size="2xl" className="text-typography-0" />
                      <Progress value={verificationProgress} size="md" className="w-3/4">
                        <ProgressFilledTrack />
                      </Progress>
                      <Text size="xs" className="text-typography-0 font-outfit">
                        {verificationProgress}%
                      </Text>
                    </VStack>
                  ) : (
                    <Box className="overflow-hidden rounded-full w-full h-full">
                      <Image
                        source={{ uri: selfieImage }}
                        alt="Selfie"
                        className="w-full h-full"
                        contentFit="cover"
                      />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Success Message */}
              {!isVerifying && (
                <VStack space="xs" className="items-center">
                  <HStack space="sm" className="items-center">
                    <Icon as={CheckCircleIcon} size="lg" className="text-success-600" />
                    <Text size="xl" className="font-outfit-semibold text-success-900">
                      Identity Verified!
                    </Text>
                  </HStack>
                  {verificationResult && (
                    <VStack space="xs" className="items-center">
                      {verificationResult.similarity && (
                        <Text size="md" className="text-typography-600 text-center font-outfit">
                          Match Score: {verificationResult.similarity.toFixed(1)}%
                        </Text>
                      )}
                      {(verificationResult.extractedFirstName || verificationResult.extractedLastName) && (
                        <Text size="md" className="text-typography-600 text-center font-outfit">
                          Name: {verificationResult.extractedFirstName} {verificationResult.extractedLastName}
                        </Text>
                      )}
                      <Text size="lg" className="text-typography-600 text-center font-outfit">
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
                    <ButtonText className="font-outfit-medium">Retake Photo</ButtonText>
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
              <Text size="lg" className="font-outfit-semibold text-typography-900">
                Selfie Tips:
              </Text>
              <VStack space="xs">
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">•</Text>
                  <Text size="md" className="text-typography-600 flex-1 font-outfit">
                    Remove glasses and hats
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">•</Text>
                  <Text size="md" className="text-typography-600 flex-1 font-outfit">
                    Make sure your face is well-lit
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">•</Text>
                  <Text size="md" className="text-typography-600 flex-1 font-outfit">
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
