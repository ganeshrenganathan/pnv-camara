import axios from "axios";
import { BaseAdapter } from "./base.js";
import { getByPath } from "../utils.js";

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * GsmaOpenGatewayAdapter implements the GSMA Open Gateway CAMARA
 * Number Verification API using OAuth2 client credentials.
 *
 * Sandbox portal: https://opengateway.gsma.com/
 *
 * Required environment variables:
 *   CAMARA_TOKEN_URL     – OAuth2 token endpoint  (e.g. https://sandbox.opengateway.telefonica.com/apigateway/v1/token)
 *   CAMARA_CLIENT_ID     – OAuth2 client_id issued by the operator portal
 *   CAMARA_CLIENT_SECRET – OAuth2 client_secret issued by the operator portal
 *   CAMARA_BASE_URL      – API gateway base URL   (e.g. https://sandbox.opengateway.telefonica.com/apigateway)
 *
 * Optional environment variables (sensible defaults for GSMA Open Gateway):
 *   CAMARA_SCOPE         – OAuth2 scope (default: dpv:FraudPreventionAndDetection#number-verification:verify)
 *   CAMARA_VERIFY_PATH   – Verify endpoint path (default: /number-verification/v0/verify)
 *   CAMARA_API_KEY       – Extra x-api-key header when required by the operator
 *   CAMARA_RESULT_PATH   – Dot-path into the JSON response to read the result
 *                          (default: devicePhoneNumberVerified, the field used by GSMA Open Gateway)
 *   CAMARA_SUCCESS_VALUES – Comma-separated truthy values (default: true)
 *
 * Swapping to a different operator is as simple as changing the five CAMARA_* env vars above
 * and optionally overriding the optional ones.
 */
export class GsmaOpenGatewayAdapter extends BaseAdapter {
  /**
   * @param {object} cfg  Subset of the parsed config.camara object.
   */
  constructor(cfg) {
    super();
    this._cfg = cfg;
    this._tokenCache = { accessToken: null, expiresAt: 0 };
  }

  getName() {
    return "gsma-open-gateway";
  }

  async getAccessToken() {
    if (this._tokenCache.accessToken && this._tokenCache.expiresAt > nowInSeconds()) {
      return this._tokenCache.accessToken;
    }

    const body = new URLSearchParams({
      grant_type: "client_credentials",
      scope: this._cfg.scope,
      client_id: this._cfg.clientId,
      client_secret: this._cfg.clientSecret
    });

    const response = await axios.post(this._cfg.tokenUrl, body.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 15000
    });

    const accessToken = response.data?.access_token;
    const expiresIn = Number(response.data?.expires_in || 300);

    if (!accessToken) {
      throw new Error("CAMARA token endpoint did not return access_token");
    }

    this._tokenCache = {
      accessToken,
      expiresAt: nowInSeconds() + Math.max(expiresIn - 10, 30)
    };

    return accessToken;
  }

  async verify({ phoneNumber, deviceIp, sessionId }) {
    const token = await this.getAccessToken();
    const url = `${this._cfg.baseUrl}${this._cfg.verifyPath}`;

    const payload = {
      phoneNumber,
      device: {
        ipv4Address: {
          publicAddress: deviceIp
        }
      }
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-correlator": sessionId
    };

    if (this._cfg.apiKey) {
      headers["x-api-key"] = this._cfg.apiKey;
    }

    const response = await axios.post(url, payload, { headers, timeout: 15000 });

    const rawResult = getByPath(response.data, this._cfg.resultPath);

    const verified = this._cfg.successValues.some(
      (okValue) => String(okValue).toLowerCase() === String(rawResult).toLowerCase()
    );

    return { verified, raw: response.data };
  }
}
