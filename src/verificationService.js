import { v4 as uuidv4 } from "uuid";
import { verifyWithCamara } from "./camaraClient.js";
import { createSession, getSession, listSessions, updateSession } from "./store.js";
import { isE164, normalizePhoneNumber } from "./utils.js";

export function startVerification({ phoneNumber }) {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  if (!isE164(normalizedPhone)) {
    return {
      ok: false,
      statusCode: 400,
      error: "phoneNumber must be E.164 format, e.g. +14155552671"
    };
  }

  const now = new Date().toISOString();

  const session = createSession({
    id: uuidv4(),
    phoneNumber: normalizedPhone,
    status: "PENDING",
    createdAt: now,
    updatedAt: now,
    lastVerification: null
  });

  return {
    ok: true,
    statusCode: 201,
    data: session
  };
}

export async function checkVerification({ sessionId, deviceIp }) {
  const session = getSession(sessionId);

  if (!session) {
    return {
      ok: false,
      statusCode: 404,
      error: "Verification session not found"
    };
  }

  if (!deviceIp) {
    return {
      ok: false,
      statusCode: 400,
      error: "deviceIp is required"
    };
  }

  try {
    const providerResponse = await verifyWithCamara({
      phoneNumber: session.phoneNumber,
      deviceIp,
      sessionId
    });

    const status = providerResponse.verified ? "VERIFIED" : "FAILED";

    const updated = updateSession(sessionId, {
      status,
      lastVerification: {
        checkedAt: new Date().toISOString(),
        deviceIp,
        provider: providerResponse.provider,
        verified: providerResponse.verified,
        raw: providerResponse.raw
      }
    });

    return {
      ok: true,
      statusCode: 200,
      data: updated
    };
  } catch (error) {
    const updated = updateSession(sessionId, {
      status: "ERROR",
      lastVerification: {
        checkedAt: new Date().toISOString(),
        deviceIp,
        provider: "camara",
        verified: false,
        error: error.response?.data || error.message
      }
    });

    return {
      ok: false,
      statusCode: error.response?.status || 502,
      error: "Failed to verify with CAMARA provider",
      data: updated
    };
  }
}

export function getVerificationSession(sessionId) {
  const session = getSession(sessionId);

  if (!session) {
    return {
      ok: false,
      statusCode: 404,
      error: "Verification session not found"
    };
  }

  return {
    ok: true,
    statusCode: 200,
    data: session
  };
}

export function getAllSessions() {
  return {
    ok: true,
    statusCode: 200,
    data: listSessions()
  };
}
