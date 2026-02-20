# Database

## Overview

The database layer uses D1 (Cloudflare's SQL database) with Drizzle ORM. This provides a relational store for scheduling data while patient records are stored as JSON in KV.

## Schema

### Tables

- **users**: Staff members (providers, nurses, schedulers)
- **appointments**: Scheduling records with references to patient KV and clinicians
- **visitDefinitions**: Configurable visit types with JSON schemas

### Relationships

- appointments → users (clinician_id)
- appointments → visitDefinitions (visit_definition_id)
- appointments → KV (patient_record_id)

## Dependencies

- drizzle-orm: SQL ORM
- drizzle-kit: Migrations
- better-sqlite3: Local dev

## Critical Decisions

- Patient records stored in KV as JSON, not in SQL
- Appointments reference patient records via KV key
- Visit definitions store schema as JSON for dynamic forms
