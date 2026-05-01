import dotenv from "dotenv";
import { asBoolean } from "./utils.js";

dotenv.config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const mockCamara = asBoolean(process.env.MOCK_CAMARA);

export const config = {
  port: Number(process.env.PORT || 3000),
  mockCamara,
  adapterName: process.env.CAMARA_ADAPTER || "gsma-open-gateway",
  camara: {
    tokenUrl: mockCamara ? process.env.CAMARA_TOKEN_URL || "mock-token-url" : required("CAMARA_TOKEN_URL"),
    clientId: mockCamara ? process.env.CAMARA_CLIENT_ID || "mock-client-id" : required("CAMARA_CLIENT_ID"),
    clientSecret: mockCamara
      ? process.env.CAMARA_CLIENT_SECRET || "mock-client-secret"
      : required("CAMARA_CLIENT_SECRET"),
    scope: process.env.CAMARA_SCOPE || "dpv:FraudPreventionAndDetection#number-verification:verify",
    baseUrl: mockCamara ? process.env.CAMARA_BASE_URL || "https://mock.camara.local" : required("CAMARA_BASE_URL"),
    verifyPath: process.env.CAMARA_VERIFY_PATH || "/number-verification/v0/verify",
    apiKey: process.env.CAMARA_API_KEY || "",
    resultPath: process.env.CAMARA_RESULT_PATH || "devicePhoneNumberVerified",
    successValues: (process.env.CAMARA_SUCCESS_VALUES || "true")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  }
};
