# File Uploads (R2)

## Overview

Patient files are stored securely in R2 (Cloudflare's S3-compatible object storage). R2 was chosen to avoid egress fees.

## Implementation

- **Bucket**: FILE_UPLOADS
- **Key Format**: `files/{patientId}/{timestamp}-{filename}`
- **Metadata**: Stored in R2 custom metadata

## Dependencies

- @cloudflare/workers-types

## Critical Decisions

- R2 avoids egress fees vs S3
- Files keyed by patient for easy listing
- Custom metadata stores patientId and uploadedBy
