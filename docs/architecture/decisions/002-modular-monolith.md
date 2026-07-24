# ADR-002: Modular Monolith

**Status**: Accepted  
**Date**: 2026-07-24

## Context

MicroIntern needs a service architecture strategy.

## Decision

**Modular Monolith** — single deployable process with strict module boundaries.

## Module Boundaries

Each domain (auth, candidate, company, trial, evaluation, pipeline) is a self-contained module with its own:
- Domain entities and business logic
- Repository interfaces
- Use cases
- HTTP routes

Modules communicate through **in-process function calls** (not HTTP).  
Cross-module dependencies go through **application layer interfaces** only — never direct infrastructure access.

## Migration Path to Microservices

If a domain needs independent scaling, it can be extracted:
1. Module already has clean interfaces — extract the repository to a remote call
2. Add a thin gRPC/HTTP client implementing the same interface
3. Zero changes to domain/application layer

The AI Evaluation module is the most likely candidate for extraction if evaluation load requires dedicated GPU workers.

## Rejection of Microservices

At founding stage:
- No team large enough to own separate services independently
- No traffic requiring independent scaling
- Distributed transactions would require sagas or 2PC — enormous complexity for ZERO benefit
- Debug experience: single process logs vs. distributed tracing across 9 services
