import { create } from "zustand";

type TripUiState = {
  activeTripId?: string;
  activeStopId?: string;
  lastToast?: string;
  drivingMode: boolean;
  setActiveTrip: (tripId?: string) => void;
  setActiveStop: (stopId?: string) => void;
  setLastToast: (message?: string) => void;
  setDrivingMode: (value: boolean) => void;
};

export const useTripStore = create<TripUiState>((set) => ({
  drivingMode: true,
  setActiveTrip(activeTripId) {
    set({ activeTripId });
  },
  setActiveStop(activeStopId) {
    set({ activeStopId });
  },
  setLastToast(lastToast) {
    set({ lastToast });
  },
  setDrivingMode(drivingMode) {
    set({ drivingMode });
  }
}));

