import { z } from "zod";

/**
 * Environment configuration schema.
 *
 * Design: ALL environment variables are validated at startup using Zod.
 * If any required variable is missing or invalid, the process exits immediately
 * with a clear error message — fail-fast prevents misconfigured deployments.
 *
 * NO module in the application reads process.env directly.
 * Every module receives config through this validated, typed object.
 * This makes configuration explicitly injectable and testable.
 */

const configSchema = z.object({
  // Application
  NODE_ENV: z.enum(["development", "test", "staging", "production"]).default("development"),
  APP_NAME: z.string().default("MicroIntern"),
  APP_VERSION: z.string().default("0.1.0"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),

  // Server
  API_PORT: z
    .string()
    .transform(Number)
    .default(process.env["PORT"] ?? "3001"),
  API_HOST: z.string().default("0.0.0.0"),
  API_BASE_URL: z.string().url().default("http://localhost:3001/api/v1"),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.string().transform(Number).default("2"),
  DATABASE_POOL_MAX: z.string().transform(Number).default("10"),

  // Redis
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default("0"),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters")
    .default("default_jwt_access_secret_for_dev_mode_only_123"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters")
    .default("default_jwt_refresh_secret_for_dev_mode_only_123"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  JWT_ISSUER: z.string().default("microintern"),
  JWT_AUDIENCE: z.string().default("microintern-api"),

  // OAuth — Google
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // OAuth — GitHub
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_CALLBACK_URL: z.string().url().optional(),

  // OAuth — LinkedIn
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CALLBACK_URL: z.string().url().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // OAuth — Microsoft
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CALLBACK_URL: z.string().url().optional(),

  // Storage
  STORAGE_PROVIDER: z.enum(["minio", "s3"]).default("minio"),
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.string().transform(Number).default("9000"),
  MINIO_USE_SSL: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  MINIO_ACCESS_KEY: z.string().default("minioadmin"),
  MINIO_SECRET_KEY: z.string().default("minioadmin"),
  MINIO_BUCKET_PUBLIC: z.string().default("microintern-public"),
  MINIO_BUCKET_PRIVATE: z.string().default("microintern-private"),
  MINIO_SIGNED_URL_EXPIRES: z.string().transform(Number).default("3600"),

  // AWS S3 (for production)
  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET_PUBLIC: z.string().optional(),
  S3_BUCKET_PRIVATE: z.string().optional(),

  // Email
  EMAIL_PROVIDER: z.enum(["smtp", "resend"]).default("smtp"),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.string().transform(Number).default("1025"),
  SMTP_SECURE: z
    .string()
    .transform((v) => v === "true")
    .default("false"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM_NAME: z.string().default("MicroIntern"),
  EMAIL_FROM_ADDRESS: z.string().email().default("noreply@microintern.io"),
  RESEND_API_KEY: z.string().optional(),

  // AI Gateway
  AI_PRIMARY_PROVIDER: z
    .enum(["groq", "openrouter", "gemini", "ollama", "huggingface"])
    .default("groq"),
  AI_FALLBACK_PROVIDERS: z.string().default("openrouter,gemini,ollama"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_DEFAULT_MODEL: z.string().default("llama-3.3-70b-versatile"),
  GROQ_MAX_TOKENS: z.string().transform(Number).default("8192"),
  GROQ_TIMEOUT_MS: z.string().transform(Number).default("30000"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_DEFAULT_MODEL: z.string().default("meta-llama/llama-3.3-70b-instruct"),
  OPENROUTER_SITE_URL: z.string().url().optional(),
  OPENROUTER_SITE_NAME: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_DEFAULT_MODEL: z.string().default("gemini-1.5-flash"),
  OLLAMA_BASE_URL: z.string().url().default("http://localhost:11434"),
  OLLAMA_DEFAULT_MODEL: z.string().default("llama3.2"),
  HUGGINGFACE_API_KEY: z.string().optional(),
  HUGGINGFACE_DEFAULT_MODEL: z.string().default("meta-llama/Llama-3.2-3B-Instruct"),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("60000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100"),
  RATE_LIMIT_AUTH_MAX_REQUESTS: z.string().transform(Number).default("10"),

  // Security
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  BCRYPT_ROUNDS: z.string().transform(Number).default("12"),
  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY must be at least 32 characters")
    .default("default_encryption_key_for_dev_mode_only_1234567"),

  // Queue
  QUEUE_CONCURRENCY_EMAIL: z.string().transform(Number).default("5"),
  QUEUE_CONCURRENCY_AI_EVALUATION: z.string().transform(Number).default("2"),
  QUEUE_CONCURRENCY_NOTIFICATION: z.string().transform(Number).default("10"),
  QUEUE_CONCURRENCY_STORAGE: z.string().transform(Number).default("5"),

  // Feature Flags
  FEATURE_OAUTH_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("true"),
  FEATURE_AI_EVALUATION_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("true"),
  FEATURE_AUDIT_LOG_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("true"),

  // Firebase Admin
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

/**
 * Validated application configuration.
 * Parse once at startup — fail fast if invalid.
 */
function loadConfig() {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    console.error("❌ Invalid environment configuration:\n" + errors);
    console.error("\nEnsure all required variables are set in your .env file.");
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  return result.data;
}

export type AppConfig = z.infer<typeof configSchema>;

/**
 * Singleton config — loaded once, used everywhere.
 * All modules import this, never process.env directly.
 */
export const config: AppConfig = loadConfig();

/**
 * Derived configuration helpers.
 */
export const isDevelopment = config.NODE_ENV === "development";
export const isProduction = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

export const corsOrigins = [
  ...new Set([
    ...config.CORS_ORIGINS.split(",").map((o) => o.trim()),
    "https://micro-intern-web.vercel.app",
    "http://localhost:3000",
  ]),
];

export const aiFallbackProviders = config.AI_FALLBACK_PROVIDERS.split(",")
  .map((p) => p.trim())
  .filter(Boolean);
