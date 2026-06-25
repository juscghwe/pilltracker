export function getRuntimeHealth() {
  return {
    status: "healthy", // TODO: sufficient for now but add actual tests or dynamically querried states here
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    uptimeSeconds: Math.round(process.uptime()),
  };
}
