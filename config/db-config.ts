// Database configuration
// Edit this file to switch between local development and server environments

// Local development configuration (default)
export const localDbConfig = {
  host: "127.0.0.1", // Local development IP
  user: "root",
  password: "Cr3ditV1aon!!!",
  database: "CreditVision",
  // Additional connection options
  connectTimeout: 10000, // 10 seconds
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Server configuration
export const serverDbConfig = {
  host: "45.56.100.174", // Server IP
  user: "root",
  password: "Cr3ditV1aon!!!",
  database: "CreditVision",
  // Additional connection options
  connectTimeout: 10000, // 10 seconds
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Set this to true to use server configuration, false to use local configuration
// When working on dev PC, set to true to use the server IP (45.56.100.174)
// When working on the server, set to false to use localhost (127.0.0.1)
const useServerConfig = true;

// Export the active configuration
export const dbConfig = useServerConfig ? serverDbConfig : localDbConfig;
