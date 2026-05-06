// This file is for local development only
const env = require("./src/config/env");
const app = require("./src/app");

// Fail fast on missing production config when deployed on cPanel/Passenger.
if (env.assertProductionConfig && typeof env.assertProductionConfig === 'function') {
  env.assertProductionConfig();
}

// Only start server if not running on Vercel
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
