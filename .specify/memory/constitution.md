<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: Development Workflow and Governance expanded to mandate zh-TW documentation.
- Added sections: Language Policy statements in Workflow and Governance.
- Removed sections: Template placeholder block eliminated to avoid duplication.
- Templates requiring updates:
	✅ Updated/Aligned: .specify/templates/plan-template.md (Constitution Check compatible; note zh-TW requirement)
	✅ Updated/Aligned: .specify/templates/spec-template.md (Write user stories and requirements in zh-TW)
	✅ Updated/Aligned: .specify/templates/tasks-template.md (Task descriptions remain; reference zh-TW doc updates)
	⚠ Pending: .specify/templates/commands/* (folder not present; verify once commands templates exist)
- Follow-up TODOs: TODO(RATIFICATION_DATE): Original adoption date unknown — supply when known.
-->

# TravelGuideLine Constitution

## Core Principles

### I. Code Quality Discipline (NON-NEGOTIABLE)
MUST maintain a consistent, readable, and reliable codebase. Enforce linting,
formatting, type safety, and documentation at the PR gate.

- Linting MUST pass with zero errors; warnings require justification.
- Formatting MUST be automated (e.g., Prettier/Black) and enforced in CI.
- Public interfaces MUST include types and docs describing inputs/outputs.
- No dead code: unused functions/paths MUST be removed within the PR.
- Code reviews MUST verify clarity, naming consistency, and small diffs.

Rationale: High-quality code prevents regressions, accelerates onboarding, and
reduces maintenance cost.

### II. Testing Standards
MUST prove behavior with tests before merging. Prioritize unit tests for logic
and contract/integration tests for boundaries and flows.

- TDD is RECOMMENDED; failing tests SHOULD precede implementation.
- Each feature MUST include unit tests for critical logic and error cases.
- Contracts (APIs/CLIs) MUST have contract tests for request/response schemas.
- Integration tests MUST cover primary user journeys and data boundaries.
- Test runtime MUST be fast; flaky tests MUST be fixed or quarantined.

Rationale: Tests provide executable proof of correctness and protect against
future changes.

### III. User Experience Consistency
MUST deliver consistent behavior, terminology, and feedback across commands,
screens, and flows.

- Terminology MUST be uniform (e.g., “Trip”, “Itinerary”) across UI and docs.
- Errors MUST be actionable: clear message, suggested next step.
- Inputs/outputs MUST follow consistent schemas and formatting.
- Accessibility SHOULD guide UI decisions; avoid reliance on color alone.
- Quickstart paths MUST be documented and validated per release.

Rationale: Consistency increases trust and learnability, reducing support load.

### IV. Performance Requirements
MUST meet baseline performance budgets and monitor them continuously.

- Define p95 latency budgets per feature; default: <200ms local operations,
	<500ms network-backed operations.
- Memory footprint SHOULD remain within reasonable bounds; avoid unnecessary
	large dependencies.
- Long-running operations MUST provide progress feedback and cancellation.
- Performance regressions MUST be detected in CI via lightweight checks or
	benchmarks where applicable.

Rationale: Performance is a core part of UX and reliability.

### V. Simplicity & Change Management
MUST prefer the simplest viable solution and manage change via semantic
versioning and deprecation policies.

- Prefer small, composable modules; avoid premature abstractions.
- Breaking changes MUST be accompanied by migration notes and flagged in
	release notes.
- Semantic Versioning applies: MAJOR for breaking changes, MINOR for feature
	additions, PATCH for fixes/clarifications.

Rationale: Simplicity reduces risk; clear change management preserves trust.

## Additional Constraints

Security and Compliance: Secrets MUST not be committed. Use environment
configuration and secure storage. Logs MUST avoid PII; structured logging is
RECOMMENDED for observability.

Technology Stack Guidance: Prefer standard, well-supported libraries. Any
non-standard choice MUST include rationale and maintenance plan.

## Development Workflow

Quality Gates: CI MUST enforce linting, formatting, tests, and minimal
performance checks. Code reviews MUST validate principles adherence.

Release Process: Tag releases with semantic versions; include change logs,
deprecations, and any migration steps.

Documentation: Features MUST ship with updated quickstart and user-facing docs
for changed behavior.

Language Policy: All specifications, implementation plans, and user-facing
documentation MUST be written in Traditional Chinese (zh-TW). Where bilingual
support is helpful, English MAY be included secondarily, but zh-TW is the
authoritative source.

## Governance

This constitution supersedes ad-hoc practices. Amendments require:

- Documentation of proposed change and rationale.
- Review and approval by maintainers.
- Migration plan for any breaking governance change.

Versioning Policy: MAJOR for incompatible governance redefinitions or
principle removals; MINOR for new principles/sections or materially expanded
guidance; PATCH for clarifications and non-semantic refinements.

Compliance Review: All PRs MUST verify conformity to Core Principles. Periodic
audits SHOULD be conducted to ensure continued adherence.

Documentation Compliance: PR reviewers MUST confirm that specs, plans, and
user-facing documentation are provided in zh-TW. Non-compliant submissions MUST
be revised before merge unless a temporary exception with a documented plan is
approved.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-12-05
