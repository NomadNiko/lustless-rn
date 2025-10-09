import { useCallback } from "react";
import { AUTH_REFRESH_URL } from "./config";
import { FetchInputType, FetchInitType } from "./types/fetch-params";
import { getTokensInfo, setTokensInfo } from "../auth/auth-tokens-info";

function useFetch() {
  return useCallback(async (input: FetchInputType, init?: FetchInitType) => {
    const tokens = await getTokensInfo();

    let headers: HeadersInit = {
      "x-custom-lang": "en",
    };

    if (!(init?.body instanceof FormData)) {
      headers = {
        ...headers,
        "Content-Type": "application/json",
      };
    }

    if (tokens?.token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${tokens.token}`,
      };
    }

    // Check if token needs refresh (expires within 60 seconds)
    if (tokens?.tokenExpires && tokens.tokenExpires - 60000 <= Date.now()) {
      console.log('[useFetch] Token expiring soon, attempting refresh...', {
        tokenExpires: new Date(tokens.tokenExpires).toISOString(),
        now: new Date().toISOString(),
      });

      try {
        const refreshResponse = await fetch(AUTH_REFRESH_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.refreshToken}`,
          },
        });

        console.log('[useFetch] Refresh response status:', refreshResponse.status);

        if (!refreshResponse.ok) {
          console.error('[useFetch] Token refresh failed with status:', refreshResponse.status);
          // Clear invalid tokens
          await setTokensInfo(null);
          throw new Error('Token refresh failed');
        }

        const newTokens = await refreshResponse.json();

        if (newTokens.token && newTokens.refreshToken && newTokens.tokenExpires) {
          console.log('[useFetch] Token refreshed successfully');
          await setTokensInfo({
            token: newTokens.token,
            refreshToken: newTokens.refreshToken,
            tokenExpires: newTokens.tokenExpires,
          });

          headers = {
            ...headers,
            Authorization: `Bearer ${newTokens.token}`,
          };
        } else {
          console.error('[useFetch] Invalid token refresh response:', newTokens);
          await setTokensInfo(null);
          throw new Error('Invalid token refresh response');
        }
      } catch (error) {
        console.error('[useFetch] Token refresh error:', error);
        // Clear tokens and let the request fail with 401
        await setTokensInfo(null);
      }
    }

    return fetch(input, {
      ...init,
      headers: {
        ...headers,
        ...init?.headers,
      },
    });
  }, []);
}

export default useFetch;
