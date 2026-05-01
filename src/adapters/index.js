import { MockAdapter } from "./mock.js";
import { GsmaOpenGatewayAdapter } from "./gsmaOpenGateway.js";

/**
 * AdapterRegistry maps adapter name strings to factory functions.
 *
 * To register a new operator adapter:
 *   1. Import its class here.
 *   2. Add an entry to REGISTRY below.
 *   3. Set CAMARA_ADAPTER=<key> in your .env file.
 */
const REGISTRY = {
  mock: (cfg) => new MockAdapter(),
  "gsma-open-gateway": (cfg) => new GsmaOpenGatewayAdapter(cfg)
};

let _instance = null;

/**
 * Returns the singleton adapter instance for this process.
 *
 * Selection order:
 *   1. MOCK_CAMARA=true  → always uses MockAdapter.
 *   2. CAMARA_ADAPTER    → name-based lookup in REGISTRY.
 *   3. Default           → gsma-open-gateway.
 *
 * @param {object} config  Parsed application config (config.camara + config.mockCamara + config.adapterName).
 * @returns {BaseAdapter}
 */
export function getAdapter(config) {
  if (_instance) return _instance;

  if (config.mockCamara) {
    _instance = new MockAdapter();
    return _instance;
  }

  const name = config.adapterName || "gsma-open-gateway";
  const factory = REGISTRY[name];

  if (!factory) {
    const available = Object.keys(REGISTRY).join(", ");
    throw new Error(
      `Unknown adapter "${name}". Available adapters: ${available}. ` +
        `Check the CAMARA_ADAPTER environment variable.`
    );
  }

  _instance = factory(config.camara);
  return _instance;
}

/**
 * Reset the singleton (useful in tests).
 */
export function resetAdapter() {
  _instance = null;
}

export { REGISTRY };
