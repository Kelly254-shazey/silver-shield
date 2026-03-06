const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { initSocket } = require("./config/socket");

const server = http.createServer(app);

env.assertProductionConfig();
initSocket(server);

if (require.main === module) {
  server.listen(env.port, () => {
    console.log(`Silver Shield API running on port ${env.port}`);
  });
}

module.exports = app;
