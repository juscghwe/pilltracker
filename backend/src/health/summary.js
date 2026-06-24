import { getRuntimeHealth } from "./runtime";
import { getPersistenceHealthPartial } from "./persistence";

export function getHealthSummary() {
  const runtimeHealth = getRuntimeHealth();
  const persistenceHealth = getPersistenceHealthPartial();
  const overallHealth = runtimeHealth.status && persistenceHealth.status;

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
