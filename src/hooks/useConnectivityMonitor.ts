import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

import { useNetworkStore } from "@/store/networkStore";

export function useConnectivityMonitor() {
  const setConnectivity = useNetworkStore((state) => state.setConnectivity);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setConnectivity({
        isOnline: Boolean(state.isConnected),
        isReachable: state.isInternetReachable ?? Boolean(state.isConnected)
      });
    });

    return unsubscribe;
  }, [setConnectivity]);
}

