export const COLLAB = {
  WS_NAMESPACE: "/ws",
  EVENTS: {
    JOIN: "join",
    SYNC: "sync",
    UPDATE: "update",
    CONNECTED: "connected",
    ERROR: "error",
  },
  REDIS: {
    UPDATES_CHANNEL: "collab:updates",
    ROOM_STATE_KEY_PREFIX: "collab:room",
    ROOM_STATE_KEY_SUFFIX: "state",
  },
  SWAGGER: {
    SUMMARY: "Get collaboration test page",
    DESCRIPTION: "Returns an HTML page for testing real-time collaboration with Yjs and Socket.IO",
  },
} as const;
