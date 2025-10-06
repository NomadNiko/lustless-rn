import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { CameraIcon, CheckCircleIcon, XIcon } from '@/components/ui/icon';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { InfoIcon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';

const { width, height } = Dimensions.get('window');
const ID_ASPECT_RATIO = 1.59; // Credit card aspect ratio
const OVERLAY_WIDTH_PERCENT = 0.85; // Overlay is 85% of screen width
const OVERLAY_WIDTH = width * OVERLAY_WIDTH_PERCENT;
const OVERLAY_HEIGHT = OVERLAY_WIDTH / ID_ASPECT_RATIO;

export default function Step2Screen() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      // Match the exact overlay dimensions
      // The overlay is OVERLAY_WIDTH_PERCENT of screen width
      // Camera photo is typically same aspect ratio as screen
      // So we crop to the same percentage of the photo

      const photoWidth = photo.width;
      const photoHeight = photo.height;

      // Use the same percentage as the overlay
      const cropWidth = photoWidth * OVERLAY_WIDTH_PERCENT;
      const cropHeight = cropWidth / ID_ASPECT_RATIO;

      // Center the crop horizontally, move up 120px vertically
      const originX = (photoWidth - cropWidth) / 2;
      const originY = ((photoHeight - cropHeight) / 2) - 120;

      const croppedPhoto = await ImageManipulator.manipulateAsync(
        photo.uri,
        [
          {
            crop: {
              originX,
              originY,
              width: cropWidth,
              height: cropHeight,
            },
          },
        ],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setIdImage(croppedPhoto.uri);
      setShowCamera(false);
    }
  };

  const handleContinue = () => {
    if (!idImage) return;
    router.push('/(auth)/sign-up/step3');
  };

  if (showCamera) {
    return (
      <Box className="flex-1 bg-background-0">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
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

          {/* ID Card Frame Guide - Centered */}
          <Box className="items-center flex-1 justify-center" style={{ pointerEvents: 'none' }}>
            <Box
              className="border-4 border-primary-500 border-dashed rounded-lg"
              style={{ width: OVERLAY_WIDTH, height: OVERLAY_HEIGHT }}
            />
            <Card className="bg-background-900/80 p-3 mt-4">
              <Text className="text-typography-0 text-center font-outfit">
                Position your ID within the frame
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
          >
            <ButtonText className="font-outfit-semibold">Back</ButtonText>
          </Button>
          <Button
            size="lg"
            onPress={handleContinue}
            isDisabled={!idImage}
            className="flex-1"
          >
            <ButtonText className="font-outfit-semibold">Continue</ButtonText>
          </Button>
        </HStack>

        {/* Header */}
        <VStack space="sm">
          <Heading size="2xl" className="text-typography-900 font-ovo">
            Verify Your Identity
          </Heading>
          <Text size="md" className="text-typography-500 font-outfit">
            Upload a photo of your government-issued ID for verification
          </Text>
        </VStack>

        {/* Info Alert */}
        <Alert action="info" variant="outline">
          <AlertIcon as={InfoIcon} />
          <AlertText className="flex-1 font-outfit">
            We use this to ensure all users are real people. Your ID is encrypted and never shared.
          </AlertText>
        </Alert>

        {/* ID Upload Area */}
        <VStack space="md" className="flex-1">
          {!idImage ? (
            /* Camera Button */
            <TouchableOpacity onPress={handleOpenCamera}>
              <Card
                variant="outline"
                className="p-8 border-2 border-dashed border-background-300"
              >
                <VStack space="md" className="items-center">
                  <Box className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center">
                    <Icon as={CameraIcon} size="2xl" className="text-primary-500" />
                  </Box>
                  <VStack space="xs" className="items-center">
                    <Text size="2xl" className="font-outfit-semibold text-typography-900">
                      Take Photo of ID
                    </Text>
                    <Text size="lg" className="text-typography-500 text-center font-outfit">
                      Use your camera to capture your government-issued ID
                    </Text>
                  </VStack>
                </VStack>
              </Card>
            </TouchableOpacity>
          ) : (
            /* ID Uploaded Success with Preview */
            <VStack space="lg">
              {/* Image Preview - Same size as overlay */}
              <Box className="w-full items-center">
                <Box
                  className="overflow-hidden rounded-lg border-2 border-primary-500"
                  style={{ width: OVERLAY_WIDTH, height: OVERLAY_HEIGHT }}
                >
                  <Image
                    source={{ uri: idImage }}
                    alt="ID Document"
                    className="w-full h-full"
                    contentFit="cover"
                  />
                </Box>
              </Box>

              {/* Success Message */}
              <VStack space="xs" className="items-center">
                <HStack space="sm" className="items-center">
                  <Icon as={CheckCircleIcon} size="lg" className="text-success-600" />
                  <Text size="xl" className="font-outfit-semibold text-success-900">
                    ID Document Captured
                  </Text>
                </HStack>
                <Button
                  variant="link"
                  size="md"
                  onPress={() => setIdImage(null)}
                  action="secondary"
                >
                  <ButtonText className="font-outfit-medium">Retake Photo</ButtonText>
                </Button>
              </VStack>
            </VStack>
          )}

          {/* Requirements */}
          <Card variant="ghost" className="p-4">
            <VStack space="sm">
              <Text size="lg" className="font-outfit-semibold text-typography-900">
                ID Requirements:
              </Text>
              <VStack space="xs">
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">•</Text>
                  <Text size="md" className="text-typography-600 flex-1 font-outfit">
                    Must be government-issued (Driver&apos;s License, Passport, or State ID)
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">•</Text>
                  <Text size="md" className="text-typography-600 flex-1 font-outfit">
                    Photo must be clear and all text must be readable
                  </Text>
                </HStack>
                <HStack space="sm" className="items-start">
                  <Text size="md" className="text-typography-900">•</Text>
                  <Text size="md" className="text-typography-600 flex-1 font-outfit">
                    ID must not be expired
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </Card>
        </VStack>

      </VStack>
    </ScrollView>
  );
}
