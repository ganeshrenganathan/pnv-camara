import axios from "axios";
import { config } from "./config.js";
import { getByPath } from "./utils.js";

let tokenCache = {
  accessToken: null,
  expiresAt: 0
};

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function fetchAccessToken() {
  if (config.mockCamara) {
    return "mock-access-token";
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: config.camara.scope,
    client_id: config.camara.clientId,
    client_secret: config.camara.clientSecret
  });

  const response = await axios.post(config.camara.tokenUrl, body.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    timeout: 15000
  });

  const accessToken = response.data?.access_token;
  const expiresIn = Number(response.data?.expires_in || 300);

  if (!accessToken) {
    throw new Error("CAMARA token endpoint did not return access_token");
  }

  tokenCache = {
    accessToken,
    expiresAt: nowInSeconds() + Math.max(expiresIn - 10, 30)
  };

  return accessToken;
}

export async function getAccessToken() {
  if (tokenCache.accessToken && tokenCache.expiresAt > nowInSeconds()) {
    return tokenCache.accessToken;
  }

  return fetchAccessToken();
}

export async function verifyWithCamara({ phoneNumber, deviceIp, sessionId }) {
  if (config.mockCamara) {
    return {
      provider: "mock-camara",
      verified: !phoneNumber.endsWith("0000"),
      raw: {
        verificationResult: !phoneNumber.endsWith("0000"),
        simulated: true
      }
    };
  }

  const token = await getAccessToken();
  const url = `${config.camara.baseUrl}${config.camara.verifyPath}`;

  const payload = {
    phoneNumber,
    device: {
      ipv4Address: deviceIp
    }
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "x-correlation-id": sessionId
  };

  if (config.camara.apiKey) {
    headers["x-api-key"] = config.camara.apiKey;
  }

  const response = await axios.post(url, payload, {
    headers,
    timeout: 15000
  });

  const result = getByPath(response.data, config.camara.resultPath);

  const verified = config.camara.successValues.some(
    (okValue) => String(okValue).toLowerCase() === String(result).toLowerCase()
  );

  return {
    provider: "camara",
    verified,
    raw: response.data
  };
}
