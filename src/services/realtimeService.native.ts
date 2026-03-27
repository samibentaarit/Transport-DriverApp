import Pusher from "pusher-js/react-native";

import { env } from "@/services/env";
import { RealtimeEvent, RealtimeEventName, RealtimeServiceContract, Unsubscribe } from "@/services/realtimeService.shared";

type PusherClient = {
  subscribe: (channelName: string) => {
    bind: (eventName: string, callback: (payload: Record<string, unknown>) => void) => void;
    unbind: (eventName: string) => void;
  };
  unsubscribe: (channelName: string) => void;
};

class RealtimeService implements RealtimeServiceContract {
  private client?: PusherClient | null;

  private connect() {
    if (env.useMocks) {
      return null;
    }

    if (!this.client) {
      this.client = new Pusher(env.broadcastKey, {
        wsHost: env.broadcastHost,
        wsPort: env.broadcastPort,
        wssPort: env.broadcastPort,
        forceTLS: env.broadcastScheme === "https",
        enabledTransports: ["ws", "wss"],
        cluster: "mt1",
        disableStats: true
      }) as unknown as PusherClient;
    }

    return this.client;
  }

  subscribeToSchool(schoolId: string, listener: (event: RealtimeEvent) => void): Unsubscribe {
    const client = this.connect();
    if (!client) {
      return () => undefined;
    }

    const channel = client.subscribe(`school.${schoolId}.trips`);
    const incidentChannel = client.subscribe(`school.${schoolId}.incidents`);
    const handlers: RealtimeEventName[] = [
      "trip.status.updated",
      "stop.arrived",
      "stop.departed",
      "boarding.recorded",
      "incident.created"
    ];

    handlers.forEach((name) => {
      if (name === "incident.created") {
        incidentChannel.bind(name, (payload: Record<string, unknown>) => listener({ name, payload }));
      } else {
        channel.bind(name, (payload: Record<string, unknown>) => listener({ name, payload }));
      }
    });

    return () => {
      handlers.forEach((name) => {
        if (name === "incident.created") {
          incidentChannel.unbind(name);
        } else {
          channel.unbind(name);
        }
      });

      client.unsubscribe(`school.${schoolId}.trips`);
      client.unsubscribe(`school.${schoolId}.incidents`);
    };
  }
}

export const realtimeService = new RealtimeService();
export type { RealtimeEvent } from "@/services/realtimeService.shared";
