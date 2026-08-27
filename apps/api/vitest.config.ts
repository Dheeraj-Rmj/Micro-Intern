import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: [],
    include: ["src/**/*.test.ts", "src/**/*.spec.ts", "tests/**/*.test.ts"],
    exclude: ["node_modules", "dist", "src/generated"],
    reporters: ["verbose"],
    testTimeout: 10_000,
    hookTimeout: 10_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/generated/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts",
        "**/__mocks__/**",
        "**/fixtures/**",
      ],
    },
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
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
