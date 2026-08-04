const STORAGE_KEY = "queuelive_device_id";

/** Anonymous, locally-generated id used to attribute reports and rate-limit
 * submissions. Not an auth mechanism — a client can always fabricate a new
 * one, so this only filters accidental/naive spam, not a determined actor. */
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    throw new Error("getDeviceId can only be called in the browser");
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
