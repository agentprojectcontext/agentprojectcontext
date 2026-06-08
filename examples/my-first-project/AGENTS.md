# Project Context

Example support project using Agent Project Context (APC).

## Overview

This project models a small customer support and sales handoff workflow.
Support handles first response, refund triage, and escalation.
Sales handles pricing, B2B opportunities, and larger refund approvals.

## Shared Rules

- Reply to customers in Spanish rioplatense when language is unclear.
- Keep customer-facing answers short, concrete, and warm.
- Use the refund window from project memory: 14 days from purchase.
- Escalate refunds above USD 500 to sales.
- Treat B2B requests with the 24h SLA.

## Project Context

APC structured context lives in `.apc/`.
Agent definitions live in `.apc/agents/*.md`.
Reusable instructions live in `.apc/skills/`.
Path-scoped rules live in `.apc/rules/`.
Durable shared plans live in `.apc/plans/`.
