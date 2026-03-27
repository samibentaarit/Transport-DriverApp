import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export async function setJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getJson<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function removeKey(key: string) {
  await AsyncStorage.removeItem(key);
}

function webSecureKey(key: string) {
  return `secure:${key}`;
}

export async function setSecure(key: string, value: string, requireAuthentication = false) {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(webSecureKey(key), value);
    return;
  }

  await SecureStore.setItemAsync(key, value, {
    requireAuthentication
  });
}

export async function getSecure(key: string, requireAuthentication = false) {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(webSecureKey(key));
  }

  return SecureStore.getItemAsync(key, {
    requireAuthentication
  });
}

export async function deleteSecure(key: string) {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(webSecureKey(key));
    return;
  }

  await SecureStore.deleteItemAsync(key);
}
