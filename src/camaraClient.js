import { config } from "./config.js";
import { getAdapter } from "./adapters/index.js";

/**
 * Returns the configured adapter's Bearer token.
 * Delegates token caching to the adapter itself.
 */
export async function getAccessToken() {
  return getAdapter(config).getAccessToken();
}

/**
 * Verify a phone number against the active mobile connection via the configured adapter.
 *
 * @param {{ phoneNumber: string, deviceIp: string, sessionId: string }} params
 * @returns {Promise<{ provider: string, verified: boolean, raw: object }>}
 */
export async function verifyWithCamara({ phoneNumber, deviceIp, sessionId }) {
  const adapter = getAdapter(config);
  const { verified, raw } = await adapter.verify({ phoneNumber, deviceIp, sessionId });

  return {
    provider: adapter.getName(),
    verified,
    raw
  };
}
