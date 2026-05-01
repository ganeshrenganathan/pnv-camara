import { BaseAdapter } from "./base.js";

/**
 * MockAdapter simulates CAMARA Number Verification without making any network calls.
 *
 * Rules:
 *   - Phone numbers ending with "0000" return verified=false.
 *   - All other numbers return verified=true.
 *
 * Activate by setting MOCK_CAMARA=true or CAMARA_ADAPTER=mock in your .env.
 */
export class MockAdapter extends BaseAdapter {
  getName() {
    return "mock";
  }

  async getAccessToken() {
    return "mock-access-token";
  }

  async verify({ phoneNumber }) {
    const verified = !phoneNumber.endsWith("0000");
    return {
      verified,
      raw: {
        verificationResult: verified,
        simulated: true
      }
    };
  }
}
