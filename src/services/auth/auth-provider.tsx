import { User } from "@/src/services/api/types/user";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthActionsContext,
  AuthContext,
  AuthTokensContext,
  TokensInfo,
  VerificationStatus,
} from "./auth-context";
import useFetch from "@/src/services/api/use-fetch";
import { API_URL, AUTH_LOGOUT_URL, AUTH_ME_URL } from "@/src/services/api/config";
import HTTP_CODES_ENUM from "../api/types/http-codes";
import {
  getTokensInfo,
  setTokensInfo as setTokensInfoToStorage,
} from "./auth-tokens-info";
import { useRouter } from "expo-router";

function AuthProvider(props: PropsWithChildren<{}>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);
  const [isVerificationLoaded, setIsVerificationLoaded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fetchBase = useFetch();
  const router = useRouter();

  const setTokensInfo = useCallback((tokensInfo: TokensInfo) => {
    setTokensInfoToStorage(tokensInfo);

    if (!tokensInfo) {
      setUser(null);
    }
  }, []);

  const logOut = useCallback(async () => {
    // Prevent multiple simultaneous logout calls
    if (isLoggingOut) {
      console.log('[AuthProvider] Logout already in progress, skipping');
      return;
    }

    setIsLoggingOut(true);
    console.log('[AuthProvider] Starting logout...');

    try {
      const tokens = await getTokensInfo();

      if (tokens?.token) {
        console.log('[AuthProvider] Calling logout endpoint...');
        await fetchBase(AUTH_LOGOUT_URL, {
          method: "POST",
        });
      }

      // Clear all auth state
      console.log('[AuthProvider] Clearing tokens and user state...');
      await setTokensInfo(null);
      setUser(null);
      setVerificationStatus(null);
      setIsVerificationLoaded(true);

      // Navigate to auth screen after logout
      console.log('[AuthProvider] Navigating to auth screen...');
      router.replace("/(auth)");
      console.log('[AuthProvider] Logout complete');
    } catch (error) {
      console.error('[AuthProvider] Error during logout:', error);
      // Still clear state even if logout endpoint fails
      await setTokensInfo(null);
      setUser(null);
      setVerificationStatus(null);
      setIsVerificationLoaded(true);
      router.replace("/(auth)");
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, setTokensInfo, fetchBase, router]);

  const fetchVerificationStatus = useCallback(async () => {
    const tokens = await getTokensInfo();

    if (!tokens?.token) {
      setVerificationStatus(null);
      setIsVerificationLoaded(true);
      return null;
    }

    try {
      const response = await fetchBase(
        `${API_URL}/api/v1/auth/verification/status`,
        {
          method: "GET",
        }
      );

      if (response.status === HTTP_CODES_ENUM.OK) {
        const data = await response.json();
        const status: VerificationStatus = {
          currentStep: data.currentStep,
          nextRoute: data.nextRoute,
          isFullyVerified:
            data.isFullyVerified || data.currentStep === "fully_verified",
          isEmailVerified: [
            "email_verified",
            "identity_verified",
            "fully_verified",
          ].includes(data.currentStep),
          isIdentityVerified: ["identity_verified", "fully_verified"].includes(
            data.currentStep
          ),
          message: data.message || "",
        };
        setVerificationStatus(status);
        return status;
      } else {
        // If verification status fails, assume unverified
        const defaultStatus: VerificationStatus = {
          currentStep: "email_verified",
          nextRoute: "/verify-identity",
          isFullyVerified: false,
          isEmailVerified: true,
          isIdentityVerified: false,
          message: "Unable to fetch verification status",
        };
        setVerificationStatus(defaultStatus);
        return defaultStatus;
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
      setVerificationStatus(null);
      return null;
    } finally {
      setIsVerificationLoaded(true);
    }
  }, [fetchBase]);

  const refreshVerificationStatus = useCallback(async () => {
    setIsVerificationLoaded(false);
    await fetchVerificationStatus();
  }, [fetchVerificationStatus]);

  const loadData = useCallback(async () => {
    console.log('[AuthProvider] Starting loadData...');
    const tokens = await getTokensInfo();
    console.log('[AuthProvider] Retrieved tokens from storage:', {
      hasToken: !!tokens?.token,
      hasRefreshToken: !!tokens?.refreshToken,
      tokenExpires: tokens?.tokenExpires,
      isExpired: tokens?.tokenExpires ? tokens.tokenExpires < Date.now() : null,
    });

    let userData: User | null = null;
    let verificationData: VerificationStatus | null = null;

    try {
      if (tokens?.token) {
        // Validate token hasn't expired
        if (tokens.tokenExpires && tokens.tokenExpires < Date.now()) {
          console.log('[AuthProvider] Token expired, logging out');
          await logOut();
          return { user: null, verificationStatus: null };
        }

        console.log('[AuthProvider] Fetching user data from /auth/me...');
        const response = await fetchBase(AUTH_ME_URL, {
          method: "GET",
        });

        console.log('[AuthProvider] /auth/me response status:', response.status);

        if (response.status === HTTP_CODES_ENUM.UNAUTHORIZED) {
          console.log('[AuthProvider] Unauthorized, logging out');
          await logOut();
          return { user: null, verificationStatus: null };
        }

        if (response.status !== HTTP_CODES_ENUM.OK) {
          console.error('[AuthProvider] Unexpected response status:', response.status);
          setUser(null);
          setVerificationStatus(null);
          setIsVerificationLoaded(true);
          return { user: null, verificationStatus: null };
        }

        const data = await response.json();
        console.log('[AuthProvider] User data loaded:', {
          id: data.id,
          email: data.email,
          verificationStep: data.verificationStep,
        });

        userData = data;
        setUser(data);

        // Fetch verification status
        console.log('[AuthProvider] Fetching verification status...');
        verificationData = await fetchVerificationStatus();
        console.log('[AuthProvider] Verification status loaded:', verificationData?.currentStep);
      } else {
        console.log('[AuthProvider] No token found, user not logged in');
        setUser(null);
        setVerificationStatus(null);
        setIsVerificationLoaded(true);
      }
    } catch (error) {
      console.error('[AuthProvider] Error in loadData:', error);
      setUser(null);
      setVerificationStatus(null);
      setIsVerificationLoaded(true);
    } finally {
      setIsLoaded(true);
      console.log('[AuthProvider] loadData complete');
    }

    return { user: userData, verificationStatus: verificationData };
  }, [fetchBase]);

  useEffect(() => {
    // Only run on mount to check for existing auth session
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = useMemo(
    () => ({
      isLoaded,
      user,
      verificationStatus,
      isVerificationLoaded,
    }),
    [isLoaded, user, verificationStatus, isVerificationLoaded]
  );

  const contextActionsValue = useMemo(
    () => ({
      setUser,
      logOut,
      refreshVerificationStatus,
      loadData,
    }),
    [logOut, refreshVerificationStatus, loadData]
  );

  const contextTokensValue = useMemo(
    () => ({
      setTokensInfo,
    }),
    [setTokensInfo]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthActionsContext.Provider value={contextActionsValue}>
        <AuthTokensContext.Provider value={contextTokensValue}>
          {props.children}
        </AuthTokensContext.Provider>
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}

export default AuthProvider;
