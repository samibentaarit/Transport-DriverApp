import { create } from "zustand";

import { STORAGE_KEYS } from "@/constants/app";
import { AuthSession } from "@/types/api";
import { User } from "@/types/models";
import { clearEncryptedStorage, getEncryptedJson, removeEncrypted, setEncryptedJson } from "@/services/encryptedStorage";
import { deleteSecure, getSecure, setSecure } from "@/services/storage";
import { createId } from "@/utils/ids";

type AuthState = {
  status: "idle" | "loading" | "authenticated" | "signed-out";
  hydrated: boolean;
  biometricEnabled: boolean;
  deviceId?: string;
  session: AuthSession | null;
  hydrate: () => Promise<void>;
  setSession: (session: AuthSession) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
};

async function getOrCreateDeviceId() {
  const existing = await getSecure(STORAGE_KEYS.deviceId);
  if (existing) {
    return existing;
  }

  const generated = createId();
  await setSecure(STORAGE_KEYS.deviceId, generated);
  return generated;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "idle",
  hydrated: false,
  biometricEnabled: false,
  session: null,
  async hydrate() {
    set({ status: "loading" });

    const [session, biometricFlag, deviceId] = await Promise.all([
      getEncryptedJson<AuthSession>(STORAGE_KEYS.authSession),
      getSecure("driver.auth.biometric"),
      getOrCreateDeviceId()
    ]);

    set({
      hydrated: true,
      biometricEnabled: biometricFlag === "true",
      deviceId,
      session,
      status: session ? "authenticated" : "signed-out"
    });
  },
  async setSession(session) {
    await setEncryptedJson(STORAGE_KEYS.authSession, session);
    set({
      session,
      status: "authenticated"
    });
  },
  async updateUser(user) {
    const session = get().session;
    if (!session) {
      return;
    }

    await get().setSession({
      ...session,
      user
    });
  },
  async signOut() {
    await Promise.all([
      removeEncrypted(STORAGE_KEYS.authSession),
      deleteSecure("driver.auth.biometric")
    ]);

    set({
      session: null,
      status: "signed-out",
      biometricEnabled: false
    });
  },
  async setBiometricEnabled(enabled) {
    await setSecure("driver.auth.biometric", enabled ? "true" : "false");
    set({ biometricEnabled: enabled });
  }
}));

export async function resetAuthState() {
  await useAuthStore.getState().signOut();
  await clearEncryptedStorage();
}
