import { getRuntimeHealth } from "./runtime.js";
import { getPersistenceHealthPartial } from "./persistence.js";

export function getHealthSummary() {
  const runtimeHealth = getRuntimeHealth();
  const persistenceHealth = getPersistenceHealthPartial();
  const overallHealth =
    runtimeHealth.status === "healthy" && persistenceHealth.status === "healthy"
      ? "healthy"
      : "unhealthy";

  return {
    status: overallHealth,
    service: "pilltracker-api", // TODO: query dynamically and add the URI
    environment: "development", // TOOD: gather from runtime
    checks: {
      runtime: {
        status: runtimeHealth.status,
      },
      persistence: {
        status: persistenceHealth.status,
        pathIsConfigured: persistenceHealth.pathIsConfigured,
      },
    },
  };
}
