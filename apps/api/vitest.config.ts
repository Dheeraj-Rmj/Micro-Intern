import path from "node:path";
import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "@microintern/config/vitest/base";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      env: {
        NODE_ENV: "test",
        API_BASE_URL: "http://localhost:3000",
        FRONTEND_URL: "http://localhost:3000",
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/test_db",
        REDIS_URL: "redis://localhost:6379",
        JWT_ACCESS_SECRET: "test_access_secret_012345678901234567890123456789",
        JWT_REFRESH_SECRET: "test_refresh_secret_012345678901234567890123456789",
        ENCRYPTION_KEY: "test_encryption_key_012345678901234567890123456789",
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }),
);
