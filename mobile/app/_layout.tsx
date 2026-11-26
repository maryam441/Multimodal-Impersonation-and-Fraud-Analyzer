import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#030712",
          },
          headerTintColor: "#f8fafc",
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 16,
          },
          contentStyle: {
            backgroundColor: "#030712",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Sentinel Shield Onboarding",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="shield"
          options={{
            title: "Sentinel Active Shield",
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
