import express from "express";
import {
  checkVerification,
  getAllSessions,
  getVerificationSession,
  startVerification
} from "./verificationService.js";

export const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Service is healthy",
    timestamp: new Date().toISOString()
  });
});

router.post("/api/verification/sessions", (req, res) => {
  const result = startVerification(req.body || {});

  if (!result.ok) {
    return res.status(result.statusCode).json({ ok: false, error: result.error });
  }

  return res.status(result.statusCode).json({ ok: true, data: result.data });
});

router.post("/api/verification/sessions/:sessionId/check", async (req, res) => {
  const result = await checkVerification({
    sessionId: req.params.sessionId,
    deviceIp: req.body?.deviceIp
  });

  if (!result.ok) {
    return res.status(result.statusCode).json({
      ok: false,
      error: result.error,
      data: result.data || null
    });
  }

  return res.status(result.statusCode).json({ ok: true, data: result.data });
});

router.get("/api/verification/sessions/:sessionId", (req, res) => {
  const result = getVerificationSession(req.params.sessionId);

  if (!result.ok) {
    return res.status(result.statusCode).json({ ok: false, error: result.error });
  }

  return res.status(result.statusCode).json({ ok: true, data: result.data });
});

router.get("/api/verification/sessions", (req, res) => {
  const result = getAllSessions();
  return res.status(result.statusCode).json({ ok: true, data: result.data });
});
