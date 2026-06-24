import { getRuntimeHealth } from "./runtime.js";
import { getPersistenceHealthPartial } from "./persistence.js";
import { appConfig } from "../config/appConfig.js";

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
    environment: appConfig.environment,
    checks: {
      runtime: {
        status: runtimeHealth.status,
        uptimeSeconds: runtimeHealth.uptimeSeconds,
      },
      persistence: {
        status: persistenceHealth.status,
        path: {
          isConfigured: persistenceHealth.path.isConfigured,
        },
      },
    },
  };
}
