/**
 * BaseAdapter defines the interface that every operator adapter must implement.
 *
 * To add a new operator:
 *   1. Create `src/adapters/<operator>.js` that extends BaseAdapter.
 *   2. Override getName(), getAccessToken(), and verify().
 *   3. Register it in src/adapters/index.js.
 *   4. Set CAMARA_ADAPTER=<operator-name> in your .env.
 */
export class BaseAdapter {
  /**
   * @returns {string} Unique lowercase identifier for this adapter, e.g. 'gsma-open-gateway'.
   */
  getName() {
    throw new Error(`${this.constructor.name} must implement getName()`);
  }

  /**
   * Fetch (or return a cached) OAuth2 access token for this operator.
   *
   * @returns {Promise<string>} Bearer token string.
   */
  async getAccessToken() {
    throw new Error(`${this.constructor.name} must implement getAccessToken()`);
  }

  /**
   * Verify whether the given phone number matches the mobile connection identified by deviceIp.
   *
   * @param {{ phoneNumber: string, deviceIp: string, sessionId: string }} params
   * @returns {Promise<{ verified: boolean, raw: object }>}
   */
  async verify({ phoneNumber, deviceIp, sessionId }) {
    throw new Error(`${this.constructor.name} must implement verify()`);
  }
}
