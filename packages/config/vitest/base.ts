import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Base Vitest configuration for all packages.
 * Individual packages extend this and add their own include paths and aliases.
 */
export const baseVitestConfig = defineConfig({
  test: {
    // Use node environment for backend packages (override to 'jsdom' for frontend)
    environment: "node",

    // Global test setup
    globals: true,
    setupFiles: [],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "src/generated/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts", // Barrel exports
        "**/__mocks__/**",
        "**/fixtures/**",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },

    // Test file patterns
    include: ["src/**/*.test.ts", "src/**/*.spec.ts", "tests/**/*.test.ts"],
    exclude: ["node_modules", "dist", "src/generated"],

    // Reporter
    reporters: ["verbose"],

    // Timeout (ms) — increase for integration tests
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
});

export default baseVitestConfig;
