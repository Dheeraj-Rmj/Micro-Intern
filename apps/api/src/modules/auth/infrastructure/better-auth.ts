import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

import { prisma } from "../../../core/database.js";
import { createModuleLogger } from "../../../core/logger.js";
import { PrismaClient } from "@microintern/database";

const log = createModuleLogger("BetterAuth");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env["BETTER_AUTH_SECRET"] || process.env["JWT_ACCESS_SECRET"] || process.env["ENCRYPTION_KEY"],
  baseURL: process.env["API_URL"]
    ? `${process.env["API_URL"]}/api/v1/auth`
    : "https://micro-intern-4stz.onrender.com/api/v1/auth",
  trustedOrigins: [
    "http://localhost:3000",
    "https://micro-intern-web.vercel.app",
    process.env["FRONTEND_URL"] || "https://micro-intern-web.vercel.app"
  ],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        required: true,
      },
      lastName: {
        type: "string",
        required: true,
      },
      username: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "CANDIDATE",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: any, ctx: any) => {
          const superAdminEmails = [
            "ceo@rmjit.com",
            "manager@rmjit.com",
            "developer1@rmjit.com",
            "developer@rmjit.com",
            "tpo@rmjit.com",
            "rmj@rmjit.com",
          ];
          if (superAdminEmails.includes(user.email)) {
            user.role = "SUPER_ADMIN";
          }
          return { data: user };
        },
        after: async (user: any, ctx: any) => {
          // If role is CANDIDATE, create CandidateProfile
          if ((user as any)["role"] === "CANDIDATE") {
            await prisma.candidateProfile.create({
              data: {
                userId: user.id,
              },
            });
          }
        },
      },
    },
    session: {
      create: {
        before: async (session: any, ctx: any) => {
          let city = "Unknown";
          let country = "Unknown";
          let region = "Unknown";

          if (session.ipAddress) {
            const geo = geoip.lookup(session.ipAddress);
            if (geo) {
              city = geo.city || "Unknown";
              country = geo.country || "Unknown";
              region = geo.region || "Unknown";
            }
          }

          let os = "Unknown";
          let browser = "Unknown";
          let deviceType = "desktop";

          if (session.userAgent) {
            const parser = new UAParser(session.userAgent);
            const parsedOS = parser.getOS();
            const parsedBrowser = parser.getBrowser();
            const parsedDevice = parser.getDevice();

            os = parsedOS.name ? `${parsedOS.name} ${parsedOS.version || ""}`.trim() : "Unknown";
            browser = parsedBrowser.name ? `${parsedBrowser.name} ${parsedBrowser.version || ""}`.trim() : "Unknown";
            deviceType = parsedDevice.type || "desktop";
          }

          log.info({ ip: session.ipAddress, city, country, os, browser }, "Enriching session with location and device info");

          return {
            data: {
              ...session,
              city,
              country,
              region,
              os,
              browser,
              deviceType,
            },
          };
        },
      },
    },
  },
  plugins: [],
});
