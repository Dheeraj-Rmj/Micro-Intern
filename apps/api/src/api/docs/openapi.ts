import { config } from "@/core/config.js";
import type { Request, Response, Router } from "express";
import { Router as createRouter } from "express";

export const OPENAPI_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MicroIntern AI-Native Competency Hiring Platform API",
    version: config.APP_VERSION,
    description:
      "Enterprise-grade skill-based hiring platform API. Evaluates demonstrated skills over traditional resumes.",
    contact: {
      name: "MicroIntern Engineering",
      url: "https://microintern.com",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "API v1 Base URL",
    },
  ],
  paths: {
    "/health/liveness": {
      get: {
        summary: "Liveness Probe",
        responses: { "200": { description: "Process is alive" } },
      },
    },
    "/health/readiness": {
      get: {
        summary: "Readiness Probe",
        responses: { "200": { description: "All dependencies are healthy" } },
      },
    },
    "/health/metrics": {
      get: {
        summary: "Prometheus Metrics",
        responses: { "200": { description: "Prometheus formatted metrics" } },
      },
    },
    "/skills": {
      get: {
        summary: "List Skill Framework taxonomy",
        responses: { "200": { description: "List of skills" } },
      },
      post: {
        summary: "Create a new skill in the framework",
        responses: { "201": { description: "Skill created" } },
      },
    },
    "/role-profiles": {
      get: {
        summary: "List role profiles for a company",
        responses: { "200": { description: "List of role profiles" } },
      },
      post: {
        summary: "Create a role profile with required skills and competencies",
        responses: { "201": { description: "Role profile created" } },
      },
    },
    "/evidence": {
      post: {
        summary: "Register candidate evidence for verified skills",
        responses: { "201": { description: "Evidence registered" } },
      },
    },
    "/verifications/verify": {
      post: {
        summary: "Verify candidate skill (State Machine: CLAIMED -> CERTIFIED)",
        responses: { "200": { description: "Skill verification status updated" } },
      },
    },
    "/matching/candidate": {
      post: {
        summary: "Match candidate against role profile (AI-native matching score)",
        responses: {
          "200": { description: "Role match result with skill gaps & growth potential" },
        },
      },
    },
    "/learning-recommendations": {
      get: {
        summary: "Get learning recommendations and career improvement roadmap",
        responses: { "200": { description: "Learning roadmap and practice projects" } },
      },
    },
    "/candidate-journeys": {
      post: {
        summary: "Start candidate journey for an organization role",
        responses: { "201": { description: "Journey started" } },
      },
    },
    "/search/skills": {
      get: {
        summary: "Search skills with cursor pagination and filtering",
        responses: { "200": { description: "Paginated skills" } },
      },
    },
  },
};

export function createDocsRoutes(): Router {
  const router = createRouter();

  router.get("/docs.json", (_req: Request, res: Response) => {
    res.status(200).json(OPENAPI_SPEC);
  });

  router.get("/docs", (_req: Request, res: Response) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MicroIntern API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
      url: '/api/v1/docs.json',
      dom_id: '#swagger-ui',
    });
  };
</script>
</body>
</html>`;
    res.set("Content-Type", "text/html");
    res.status(200).send(html);
  });

  return router;
}
