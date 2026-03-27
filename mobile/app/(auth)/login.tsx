import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/use-auth";
import { storage } from "../../utils/storage";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Check biometric availability and load remembered email
  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);

      const rememberedEmail = await storage.getRememberedEmail();
      if (rememberedEmail) {
        setEmail(rememberedEmail);
        setRememberMe(true);
      }
    })();
  }, []);

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login({ email: email.trim(), password });

      if (rememberMe) {
        await storage.setRememberedEmail(email.trim());
      } else {
        await storage.setRememberedEmail(null);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Invalid credentials. Please try again.";
      Alert.alert("Login Failed", message);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Login to HRMS",
        fallbackLabel: "Use password",
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Biometric success — check if we have stored credentials
        const biometricEnabled = await storage.isBiometricEnabled();
        if (biometricEnabled) {
          // In a real app, you'd retrieve stored credentials from SecureStore
          // and call login. For now, we prompt the user.
          Alert.alert(
            "Biometric Login",
            "Biometric verification successful. Please enter your password to complete login."
          );
        } else {
          Alert.alert(
            "Setup Required",
            "Please log in with your password first, then enable biometric login in your profile."
          );
        }
      }
    } catch {
      Alert.alert("Error", "Biometric authentication failed.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Logo / Branding */}
          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-primary-500 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="people" size={40} color="#fff" />
            </View>
            <Text className="text-2xl font-bold text-neutral-900">HRMS</Text>
            <Text className="text-sm text-neutral-500 mt-1">
              Sign in to your account
            </Text>
          </View>

          {/* Form */}
          <Input
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
            }
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            isPassword
            leftIcon={
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
            }
          />

          {/* Remember Me */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
                thumbColor={rememberMe ? "#3B82F6" : "#f4f3f4"}
              />
              <Text className="text-sm text-neutral-600 ml-2">
                Remember me
              </Text>
            </View>
          </View>

          {/* Login Button */}
          <Button onPress={handleLogin} loading={isLoading} size="lg">
            Sign In
          </Button>

          {/* Biometric Login */}
          {biometricAvailable && (
            <View className="items-center mt-6">
              <Text className="text-sm text-neutral-400 mb-3">
                Or sign in with
              </Text>
              <Button
                variant="outline"
                onPress={handleBiometricLogin}
                icon={
                  <Ionicons
                    name="finger-print"
                    size={22}
                    color="#3B82F6"
                  />
                }
              >
                Biometric Login
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
