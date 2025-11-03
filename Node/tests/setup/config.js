/**
 * Configuration centralisée pour les tests
 * Principe: Single Responsibility - Gestion de la configuration uniquement
 */

import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Configuration API
  api: {
    baseUrl: process.env.TEST_API_URL || "http://localhost:3000",
    timeout: parseInt(process.env.TEST_TIMEOUT || "5000", 10),
  },

  // Credentials de test
  credentials: {
    admin: {
      email: process.env.ADMIN_EMAIL || "admin@porsche.com",
      password: process.env.ADMIN_PASSWORD || "Admin123!@#",
    },
    user: {
      emailPrefix: "test-user",
      emailDomain: "@gmail.com",
      password: "User123!@#",
    },
  },

  // Configuration des tests
  test: {
    retryAttempts: parseInt(process.env.TEST_RETRY_ATTEMPTS || "3", 10),
    retryDelay: parseInt(process.env.TEST_RETRY_DELAY || "1000", 10),
    cleanupAfterTests: process.env.TEST_CLEANUP === "true" || true,
  },

  // Délais d'attente
  delays: {
    betweenTests: 500,
    serverStart: 2000,
    apiCall: 100,
  },
};

export default config;
