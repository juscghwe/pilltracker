const PORT = process.env.PORT || 3000;

/** Dynamic import of `./app.js` to catch startup error. */
async function startServer() {
  const { default: app } = await import("./app.js");

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

try {
  await startServer();
} catch (error) {
  console.error("Backendd failed to start.");
  console.error(error);

  process.exit(1);
}
