import * as SecureStore from "expo-secure-store";

const KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user_data",
  BIOMETRIC_ENABLED: "biometric_enabled",
  REMEMBER_EMAIL: "remember_email",
} as const;

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("SecureStore setItem error:", error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("SecureStore removeItem error:", error);
    }
  },

  // Token helpers
  async getAccessToken(): Promise<string | null> {
    return this.getItem(KEYS.ACCESS_TOKEN);
  },

  async setAccessToken(token: string): Promise<void> {
    return this.setItem(KEYS.ACCESS_TOKEN, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return this.getItem(KEYS.REFRESH_TOKEN);
  },

  async setRefreshToken(token: string): Promise<void> {
    return this.setItem(KEYS.REFRESH_TOKEN, token);
  },

  async clearTokens(): Promise<void> {
    await this.removeItem(KEYS.ACCESS_TOKEN);
    await this.removeItem(KEYS.REFRESH_TOKEN);
  },

  // User data helpers
  async getUser(): Promise<string | null> {
    return this.getItem(KEYS.USER);
  },

  async setUser(userData: string): Promise<void> {
    return this.setItem(KEYS.USER, userData);
  },

  // Biometric preference
  async isBiometricEnabled(): Promise<boolean> {
    const value = await this.getItem(KEYS.BIOMETRIC_ENABLED);
    return value === "true";
  },

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    return this.setItem(KEYS.BIOMETRIC_ENABLED, String(enabled));
  },

  // Remember email
  async getRememberedEmail(): Promise<string | null> {
    return this.getItem(KEYS.REMEMBER_EMAIL);
  },

  async setRememberedEmail(email: string | null): Promise<void> {
    if (email) {
      return this.setItem(KEYS.REMEMBER_EMAIL, email);
    }
    return this.removeItem(KEYS.REMEMBER_EMAIL);
  },
};

export { KEYS };
