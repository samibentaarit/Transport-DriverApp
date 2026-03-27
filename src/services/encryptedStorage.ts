import { Buffer } from "buffer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AESEncryptionKey,
  AESSealedData,
  aesDecryptAsync,
  aesEncryptAsync
} from "expo-crypto";

import { STORAGE_KEYS } from "@/constants/app";
import { deleteSecure, getSecure, removeKey, setSecure } from "@/services/storage";

async function loadKey() {
  const keyHex = await getSecure(STORAGE_KEYS.authKey);
  if (keyHex) {
    return AESEncryptionKey.import(keyHex, "hex");
  }

  const key = await AESEncryptionKey.generate();
  const encoded = await key.encoded("hex");
  await setSecure(STORAGE_KEYS.authKey, encoded);
  return key;
}

function encodeBase64(value: string) {
  return Buffer.from(value, "utf8").toString("base64");
}

function decodeBase64(value: string) {
  return Buffer.from(value, "base64").toString("utf8");
}

function bytesToBase64(value: Uint8Array) {
  return Buffer.from(value).toString("base64");
}

function base64ToBytes(value: string) {
  return new Uint8Array(Buffer.from(value, "base64"));
}

export async function setEncryptedJson<T>(key: string, value: T) {
  const encryptionKey = await loadKey();
  const plaintext = encodeBase64(JSON.stringify(value));
  const sealed = await aesEncryptAsync(plaintext, encryptionKey);
  const combined = await sealed.combined();
  await AsyncStorage.setItem(key, bytesToBase64(combined));
}

export async function getEncryptedJson<T>(key: string): Promise<T | null> {
  const encrypted = await AsyncStorage.getItem(key);
  if (!encrypted) {
    return null;
  }

  const encryptionKey = await loadKey();
  const sealed = AESSealedData.fromCombined(base64ToBytes(encrypted));
  const decrypted = await aesDecryptAsync(sealed, encryptionKey, { output: "base64" });
  return JSON.parse(decodeBase64(decrypted as string)) as T;
}

export async function removeEncrypted(key: string) {
  await removeKey(key);
}

export async function clearEncryptedStorage() {
  await deleteSecure(STORAGE_KEYS.authKey);
}

