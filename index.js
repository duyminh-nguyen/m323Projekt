/**
 * @fileoverview Entry Point
 *
 * Minimal entry point: imports the CLI layer and starts the loop.
 * No business logic lives here — it is purely a launcher.
 */

const { run } = require("./cli/menu");

run().catch((err) => {
  console.error("\n  Fatal error:", err.message);
  process.exit(1);
});

