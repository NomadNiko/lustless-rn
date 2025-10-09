import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tokens } from '../api/types/tokens';

const AUTH_TOKEN_KEY = '@lustless:auth-tokens';

export type TokensInfo = Tokens | null;

export async function getTokensInfo(): Promise<TokensInfo> {
  try {
    const data = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load tokens:', error);
    return null;
  }
}

export async function setTokensInfo(tokens: TokensInfo): Promise<void> {
  try {
    if (tokens) {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(tokens));
    } else {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch (error) {
    console.error('Failed to save tokens:', error);
  }
}
