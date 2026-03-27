import "@testing-library/jest-native/extend-expect";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined)
}));

jest.mock("expo-crypto", () => ({
  randomUUID: jest.fn(() => "test-uuid"),
  AESEncryptionKey: {
    generate: jest.fn(async () => ({
      encoded: jest.fn(async () => "test-key")
    })),
    import: jest.fn(() => ({
      encoded: jest.fn(async () => "test-key")
    }))
  },
  AESSealedData: {
    fromCombined: jest.fn((value) => value)
  },
  aesEncryptAsync: jest.fn(async (value: string) => ({
    combined: jest.fn(async () => new Uint8Array(Buffer.from(value, "utf8")))
  })),
  aesDecryptAsync: jest.fn(async (value: Uint8Array) => Buffer.from(value).toString("utf8"))
}));
