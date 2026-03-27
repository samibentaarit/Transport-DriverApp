import { create } from "zustand";

type NetworkState = {
  isOnline: boolean;
  isReachable: boolean;
  lastChangeAt?: string;
  setConnectivity: (state: { isOnline: boolean; isReachable: boolean }) => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: true,
  isReachable: true,
  setConnectivity(state) {
    set({
      ...state,
      lastChangeAt: new Date().toISOString()
    });
  }
}));

