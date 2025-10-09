import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_DATA_KEY = '@lustless:onboarding-data';

export type OnboardingData = {
  idDocumentId?: string;
  selfieId?: string;
  email?: string;
};

export async function getOnboardingData(): Promise<OnboardingData | null> {
  try {
    const data = await AsyncStorage.getItem(ONBOARDING_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load onboarding data:', error);
    return null;
  }
}

export async function setOnboardingData(data: OnboardingData): Promise<void> {
  try {
    const existing = await getOnboardingData();
    const merged = { ...existing, ...data };
    await AsyncStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(merged));
  } catch (error) {
    console.error('Failed to save onboarding data:', error);
  }
}

export async function clearOnboardingData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ONBOARDING_DATA_KEY);
  } catch (error) {
    console.error('Failed to clear onboarding data:', error);
  }
}
