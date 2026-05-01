# CAMARA Phone Number Verification System

A backend service that verifies if a phone number belongs to the active mobile connection using [GSMA Open Gateway](https://opengateway.gsma.com/) CAMARA Number Verification APIs. Built on an **adapter framework** so the credentials and endpoint can be swapped for any operator worldwide by changing environment variables.

## What this service does

- Creates verification sessions for E.164 phone numbers.
- Calls CAMARA Number Verification API for each session check.
- Stores session status in-memory (`PENDING`, `VERIFIED`, `FAILED`, `ERROR`).
- Ships with a `GsmaOpenGatewayAdapter` pre-configured for the GSMA Open Gateway sandbox.
- Supports `MOCK_CAMARA=true` (or `CAMARA_ADAPTER=mock`) for local testing without any live APIs.

## Prerequisites

- Node.js 20+
- CAMARA API credentials from your operator/aggregator (or use mock mode)

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env
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

## Adapter System

The service uses a pluggable adapter architecture. Each operator is implemented as a single file that extends `BaseAdapter`.

### Selecting an adapter

Set `CAMARA_ADAPTER` in your `.env`:

| Value | Description |
|---|---|
| `gsma-open-gateway` | Default. Targets the GSMA Open Gateway sandbox or any compatible operator. |
| `mock` | Local testing — no network calls. Same as setting `MOCK_CAMARA=true`. |

### Configuring the GSMA Open Gateway adapter

Sign up at the [GSMA Open Gateway portal](https://opengateway.gsma.com/) (or your operator's developer portal) to obtain credentials, then set:

```bash
CAMARA_ADAPTER=gsma-open-gateway
CAMARA_TOKEN_URL=https://sandbox.opengateway.telefonica.com/apigateway/v1/token
CAMARA_CLIENT_ID=<your-client-id>
CAMARA_CLIENT_SECRET=<your-client-secret>
CAMARA_BASE_URL=https://sandbox.opengateway.telefonica.com/apigateway
# Keep defaults below unless your operator differs:
CAMARA_VERIFY_PATH=/number-verification/v0/verify
CAMARA_RESULT_PATH=devicePhoneNumberVerified
CAMARA_SUCCESS_VALUES=true
```

### Adding a new operator adapter

1. Create `src/adapters/<operator>.js` and extend `BaseAdapter`:

```js
import { BaseAdapter } from "./base.js";

export class AcmeOperatorAdapter extends BaseAdapter {
  getName() { return "acme-operator"; }

  async getAccessToken() { /* fetch bearer token */ }

  async verify({ phoneNumber, deviceIp, sessionId }) {
    // call operator-specific endpoint
    return { verified: true, raw: responseBody };
  }
}
```

2. Register it in `src/adapters/index.js`:

```js
import { AcmeOperatorAdapter } from "./acme.js";

const REGISTRY = {
  // ...existing adapters...
  "acme-operator": (cfg) => new AcmeOperatorAdapter(cfg)
};
```

3. Set `CAMARA_ADAPTER=acme-operator` in your `.env`.

## Testing locally without operator APIs

Set in `.env`:

```bash
MOCK_CAMARA=true
```

Or:

```bash
CAMARA_ADAPTER=mock
```

Behavior:

- Any number ending with `0000` is treated as failed verification.
- Others return success.

## Running tests

```bash
npm test
```

Runs 44 tests across utilities, adapter framework, and verification service logic using Node.js built-in test runner (no extra dependencies).

## CAMARA response parsing notes

Different operator implementations may use different response field names. Override these env vars if needed:

- `CAMARA_RESULT_PATH`: dot-path to the verification result in the JSON response (default: `devicePhoneNumberVerified`).
- `CAMARA_SUCCESS_VALUES`: comma-separated values that count as a match (default: `true`).

## Production recommendations

- Replace in-memory session storage with Redis or a database.
- Add authentication/authorization to API endpoints.
- Add rate limiting and idempotency keys.
- Encrypt and minimize sensitive data retention.
- Capture audit logs for verification decisions.
