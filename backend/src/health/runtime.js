/**
 * Returns runtime health for the current Node.js backend process.
 *
 * @returns {{
 *   status: "healthy",
 *   nodeVersion: string,
 *   platform: NodeJS.Platform,
 *   architecture: string,
 *   uptimeSeconds: number,
 * }}
 * @see ./README.md#runtime-health
 */

export function getRuntimeHealth() {
  return {
    status: "healthy", // TODO: sufficient for now but add actual tests or dynamically querried states here
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    uptimeSeconds: Math.round(process.uptime()),
  };
}
