# Scheduling Wizard Component

## Overview

Multi-step wizard for scheduling appointments with patient type awareness.

## Features

- 4-step wizard: Patient → Visit → Clinician → Schedule
- Form validation at each step
- Visit type awareness (duration from visit definition)
- Summary/confirmation step
- Integration with clinic data

## Dependencies

- @mantine/core
- @mantine/dates
- @tabler/icons-react

## Steps

1. **Patient Selection**: Choose from existing patients
2. **Visit Type**: Select visit type, shows duration
3. **Clinician**: Choose provider
4. **Schedule**: Pick date/time with notes

## Usage

```tsx
<SchedulingWizard
  visitDefinitions={visitDefs}
  clinicians={clinicians}
  patients={patients}
  onSubmit={(data) => console.log(data)}
  onCancel={() => close()}
/>
```
