/**
 * Loose JSON object shape used by smoke-test response validators.
 *
 * @typedef {Record<string, any>} SmokeResponseBody
 */

/**
 * @typedef {object} SmokeEndpoint
 * @property {string} name Human-readable smoke-test name.
 * @property {string} path API path to request.
 * @property {number} expectedStatus Expected HTTP status code.
 * @property {(body: SmokeResponseBody) => boolean} validateBody Response body validator.
 */

const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const retries = Number(process.env.SMOKE_RETRIES ?? 10);
const delayMs = Number(process.env.SMOKE_DELAY_MS ?? 1000);

/** @type {SmokeEndpoint[]} */
const endpoints = [
  {
    name: "Runtime health",
    path: "/api/health/runtime",
    expectedStatus: 200,
    validateBody: (body) =>
      body.status === "healthy" &&
      typeof body.uptimeSeconds === "number" &&
      typeof body.nodeVersion === "string",
  },
  {
    name: "Compact persistence health",
    path: "/api/health/persistence",
    expectedStatus: 200,
    validateBody: (body) =>
      body.status === "healthy" &&
      body.path.isConfigured === true &&
      typeof body.adapter?.id === "string" &&
      typeof body.engine?.version === "string" &&
      !("journalMode" in body) &&
      !("error" in body),
  },
  {
    name: "Detailed persistence health",
    path: "/api/health/persistence?details=full",
    expectedStatus: 200,
    validateBody: (body) =>
      body.status === "healthy" &&
      body.path.isConfigured === true &&
      typeof body.adapter?.sourceModule === "string" &&
      typeof body.journalMode?.active === "string",
  },
  {
    name: "Backend stack health",
    path: "/api/health",
    expectedStatus: 200,
    validateBody: (body) =>
      body.status === "healthy" &&
      body.service === "pilltracker-api" &&
      body.checks.runtime.status === "healthy" &&
      body.checks.persistence.status === "healthy" &&
      body.checks.devNotes.status === "healthy",
  },
  {
    name: "Compact dev-notes health",
    path: "/api/health/dev-notes",
    expectedStatus: 200,
    validateBody: (body) =>
      body.status === "healthy" &&
      typeof body.enabled === "boolean" &&
      Array.isArray(body.storage) &&
      body.storage.every(
        (entry) =>
          typeof entry.storageKind === "string" &&
          typeof entry.status === "string" &&
          typeof entry.enabled === "boolean" &&
          !("repository" in entry),
      ),
  },
  {
    name: "Detailed dev-notes health",
    path: "/api/health/dev-notes?details=full",
    expectedStatus: 200,
    validateBody: (body) =>
      body.status === "healthy" &&
      Array.isArray(body.storage) &&
      body.storage
        .filter((entry) => entry.enabled)
        .every(
          (entry) =>
            entry.repository?.status === "healthy" &&
            entry.repository?.schema?.ok === true &&
            Array.isArray(entry.repository?.schema?.actualColumns),
        ),
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(endpoint) {
  const url = `${baseUrl}${endpoint.path}`;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url);

      if (response.status !== endpoint.expectedStatus) {
        throw new Error(`Expected HTTP ${endpoint.expectedStatus}, got HTTP ${response.status}`);
      }

      const body = await response.json();

      if (!endpoint.validateBody(body)) {
        throw new Error(`Unexpected response body: ${JSON.stringify(body)}`);
      }

      console.log(`${endpoint.name} passed: ${url}`);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (attempt === retries) {
        throw new Error(`${endpoint.name} failed after ${retries} attempts: ${message}`, {
          cause: error,
        });
      }

      console.log(`${endpoint.name} not ready yet, retrying (${attempt}/${retries})...`);
      await sleep(delayMs);
    }
  }
}

for (const endpoint of endpoints) {
  await fetchWithRetry(endpoint);
}
