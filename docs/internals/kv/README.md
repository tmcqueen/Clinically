# Patient Records (KV)

## Overview

Patient records are stored as JSON in Cloudflare KV for flexibility. This allows storing variable-length medical data without SQL schema changes.

## Implementation

- **Namespace**: PATIENT_RECORDS
- **Key Format**: `patient:{id}`
- **Storage**: JSON serialization

## Dependencies

- @cloudflare/workers-types

## Critical Decisions

- Full patient records in KV, scheduling metadata in D1
- Key format uses `patient:` prefix for easy listing
- Emergency contact nested as object
