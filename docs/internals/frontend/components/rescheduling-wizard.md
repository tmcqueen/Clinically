# Rescheduling Wizard Component

## Overview

Wizard for rescheduling appointments with time suggestions based on visit type.

## Features

- Two modes: Wizard and Drag-and-Drop
- Smart time suggestions based on visit duration
- Choose alternative clinician
- Custom date/time selection
- Shows current appointment info

## Dependencies

- @mantine/core
- @mantine/dates
- @tabler/icons-react
- dayjs

## Usage

```tsx
<ReschedulingWizard
  appointment={appointment}
  clinicians={clinicians}
  onReschedule={(newTime, clinicianId) => {}}
  onCancel={() => close()}
/>
```
