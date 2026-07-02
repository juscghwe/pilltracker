const baseUrl = process.env.API_BASE_URL ?? "http://localhost:3000";
const retries = Number(process.env.SMOKE_RETRIES ?? 10);
const delayMs = Number(process.env.SMOKE_DELAY_MS ?? 1000);

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
    name: "Persistence health",
    path: "/api/health/persistence",
    expectedStatus: 200,
    validateBody: (body) => body.status === "healthy" && body.path.isConfigured === true,
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
    name: "Dev-notes subsystem health",
    path: "/api/health/dev-notes",
    expectedStatus: 200,
    validateBody: (body) =>
      body.status === "healthy" &&
      typeof body.enabled === "boolean" &&
      typeof body.storage.storageKind === "string" &&
      typeof body.storage.status === "string" &&
      typeof body.storage.enabled === "boolean",
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
      if (attempt === retries) {
        throw new Error(`${endpoint.name} failed after ${retries} attempts: ${error.message}`, {
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
