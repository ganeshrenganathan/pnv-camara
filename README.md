# CAMARA Phone Number Verification System

A starter backend service that verifies if a phone number belongs to the active mobile connection using CAMARA Number Verification APIs.

## What this service does

- Creates verification sessions for E.164 phone numbers.
- Calls CAMARA Number Verification API for each session check.
- Stores session status in-memory (`PENDING`, `VERIFIED`, `FAILED`, `ERROR`).
- Supports `MOCK_CAMARA=true` mode for local testing.

## Prerequisites

- Node.js 20+
- CAMARA API credentials from your operator/aggregator

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Update `.env` with your provider endpoints and credentials.

4. Start the service:

```bash
npm run dev
```

Server defaults to `http://localhost:3000`.

## Mock Data Web Page

Open `http://localhost:3000` to use a simple browser console that can:

- Generate mock E.164 phone numbers.
- Generate mock device IP addresses.
- Create, check, and query verification sessions.

This page calls the same backend endpoints documented below.

## API Endpoints

### 1) Create a verification session

`POST /api/verification/sessions`

Request body:

```json
{
  "phoneNumber": "+14155552671"
}
```

Example:

```bash
curl -X POST http://localhost:3000/api/verification/sessions \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+14155552671"}'
```

### 2) Check a session with CAMARA

`POST /api/verification/sessions/:sessionId/check`

Request body:

```json
{
  "deviceIp": "203.0.113.18"
}
```

Example:

```bash
curl -X POST http://localhost:3000/api/verification/sessions/<SESSION_ID>/check \
  -H "Content-Type: application/json" \
  -d '{"deviceIp":"203.0.113.18"}'
```

### 3) Get one session

`GET /api/verification/sessions/:sessionId`

### 4) List all sessions

`GET /api/verification/sessions`

## CAMARA integration notes

Operator implementations can vary in field names and response payload shape. This starter includes:

- `CAMARA_RESULT_PATH`: where to read verification result from response JSON.
- `CAMARA_SUCCESS_VALUES`: comma-separated values that count as successful verification.

If your provider requires different payload fields, update `src/camaraClient.js` in `verifyWithCamara`.

## Testing locally without operator APIs

Set in `.env`:

```bash
MOCK_CAMARA=true
```

Behavior:

- Any number ending with `0000` is treated as failed verification.
- Others return success.

## Production recommendations

- Replace in-memory session storage with Redis or a database.
- Add authentication/authorization to API endpoints.
- Add rate limiting and idempotency keys.
- Encrypt and minimize sensitive data retention.
- Capture audit logs for verification decisions.
