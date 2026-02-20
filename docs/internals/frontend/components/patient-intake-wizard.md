# Patient Intake Wizard Component

## Overview

Multi-step wizard for registering new patients with comprehensive intake form.

## Features

- 4-step wizard: Personal → Contact → Insurance → Medical
- Form validation at each step
- Emergency contact information
- Medical history, medications, allergies
- Review step before submission
- Data matches KV storage schema

## Dependencies

- @mantine/core
- @mantine/dates
- @tabler/icons-react

## Steps

1. **Personal**: Name, DOB
2. **Contact**: Phone, email, address
3. **Insurance**: Provider, policy number
4. **Medical**: Emergency contact, medical history, medications, allergies

## Usage

```tsx
<PatientIntakeWizard
  onSubmit={(data) => savePatient(data)}
  onCancel={() => close()}
/>
```
