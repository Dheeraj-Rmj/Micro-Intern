import { AppError } from "./AppError.js";

import type { ErrorCode } from "@microintern/shared";

/**
 * Domain errors — thrown from domain layer entities and value objects.
 *
 * Domain errors represent business rule violations.
 * They are always operational (expected) and map to 422 Unprocessable Entity
 * because the request was syntactically valid but violated domain invariants.
 *
 * Examples:
 * - "Assessment duration must be at least 30 minutes"
 * - "Candidate cannot submit a assessment they are not invited to"
 * - "Company cannot have more than 5 active assessments on the FREE plan"
 */
export class DomainError extends AppError {
  public readonly domain: string;

  constructor({
    code,
    message,
    domain,
    details,
  }: {
    code: ErrorCode;
    message: string;
    domain: string;
    details?: Record<string, unknown>[];
  }) {
    super({
      code,
      message,
      statusCode: 422,
      isOperational: true,
      details,
    });
    this.domain = domain;
  }
}

// ── Pre-built domain errors per bounded context ───────────────────────────

export class AssessmentDomainError extends DomainError {
  constructor(code: ErrorCode, message: string) {
    super({ code, message, domain: "Assessment" });
  }
}

export class EvaluationDomainError extends DomainError {
  constructor(code: ErrorCode, message: string) {
    super({ code, message, domain: "Evaluation" });
  }
}

export class AuthDomainError extends DomainError {
  constructor(code: ErrorCode, message: string) {
    super({ code, message, domain: "Auth" });
  }
}

export class CandidateDomainError extends DomainError {
  constructor(code: ErrorCode, message: string) {
    super({ code, message, domain: "Candidate" });
  }
}

export class CompanyDomainError extends DomainError {
  constructor(code: ErrorCode, message: string) {
    super({ code, message, domain: "Company" });
  }
}
