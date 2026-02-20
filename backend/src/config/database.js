const mysql = require("mysql2/promise");
const env = require("./env");

const authPlugins = {
  // MariaDB on some Windows installs asks for GSSAPI auth by default.
  // mysql2 has no built-in handler, so we provide a no-op plugin to complete auth.
  auth_gssapi_client: () => () => Buffer.from(""),
};

const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  database: env.dbName,
  user: env.dbUser,
  password: env.dbPassword,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  authPlugins,
});

function enrichDatabaseError(error) {
  if (!error || typeof error.message !== "string") {
    return error;
  }

  if (error.message.includes("auth_gssapi_client")) {
    const enriched = new Error(
      "Database authentication failed with MariaDB plugin auth_gssapi_client. Configure DB_USER/DB_PASSWORD for this server or use a mysql_native_password/caching_sha2_password account.",
    );
    enriched.statusCode = 500;
    enriched.code = error.code || "AUTH_PLUGIN_UNSUPPORTED";
    enriched.cause = error;
    return enriched;
  }

  return error;
}

async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    throw enrichDatabaseError(error);
  }
}

module.exports = {
  pool,
  query,
  authPlugins,
};
