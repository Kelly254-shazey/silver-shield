const env = require("./src/config/env");
const app = require("./src/app");

// Fail fast on missing production config when deployed on cPanel/Passenger.
env.assertProductionConfig();

module.exports = app;
