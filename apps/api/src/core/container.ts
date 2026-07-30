import { prisma } from "./database.js";
import { getRedisClient } from "./redis.js";
import { AIFallbackEngine } from "../infrastructure/ai/AIFallbackEngine.js";
import { createAIProviders } from "../infrastructure/ai/index.js";

import type { PrismaClient } from "@microintern/database";
import type { Redis } from "ioredis";

/**
 * Application Service Container — Manual Factory Pattern.
 *
 * Design philosophy:
 * This is NOT a DI framework. It is a typed factory registry.
 *
 * Why manual factories over tsyringe/inversify?
 * 1. Zero runtime overhead — no reflection metadata
 * 2. Full TypeScript inference — no decorator magic
 * 3. No `reflect-metadata` polyfill required
 * 4. Explicit dependency graph — you can trace every dependency by reading code
 * 5. Easier to test — inject mocks directly, no container reset needed
 *
 * Pattern: Lazy singletons. Each service is created once on first access.
 * Infrastructure (prisma, redis) are injected at container creation time.
 *
 * Feature modules register their own services into this container
 * via the registerModule() pattern. See each module's index.ts.
 */

export type InfrastructureDependencies = {
  db: PrismaClient;
  redis: Redis;
  aiEngine: AIFallbackEngine;
};

class ApplicationContainer {
  private readonly services = new Map<string, unknown>();

  constructor(private readonly infra: InfrastructureDependencies) {}

  /**
   * Register a lazy singleton service factory.
   * The factory is called once on first get(), result is cached.
   */
  register<T>(key: string, factory: (infra: InfrastructureDependencies) => T): void {
    this._factories.set(key, factory);
  }

  private readonly _factories = new Map<string, (infra: InfrastructureDependencies) => unknown>();

  /**
   * Retrieve a registered service by key.
   * Creates and caches the instance on first call.
   */
  get<T>(key: string): T {
    if (!this.services.has(key)) {
      const factory = this._factories.get(key);
      if (factory === undefined) {
        throw new Error(
          `Service "${key}" not registered in ApplicationContainer. ` +
            `Did you forget to call registerModule()?`,
        );
      }
      this.services.set(key, factory(this.infra));
    }
    return this.services.get(key) as T;
  }

  /**
   * Expose infrastructure dependencies for modules that need direct access.
   */
  get db(): PrismaClient {
    return this.infra.db;
  }

  get redis(): Redis {
    return this.infra.redis;
  }
}

/**
 * Singleton container instance.
 * Initialized once at application startup.
 */
let containerInstance: ApplicationContainer | null = null;

export function createContainer(): ApplicationContainer {
  if (containerInstance !== null) {
    return containerInstance;
  }

  containerInstance = new ApplicationContainer({
    db: prisma,
    redis: getRedisClient(),
    aiEngine: new AIFallbackEngine(createAIProviders()),
  });

  return containerInstance;
}

export function getContainer(): ApplicationContainer {
  if (containerInstance === null) {
    throw new Error("Container not initialized. Call createContainer() first.");
  }
  return containerInstance;
}

export type { ApplicationContainer };
