# Schedule Calendar Component

## Overview

Calendar component for viewing and managing clinic appointments with filtering and color-coding.

## Features

- Multiple views: Day, Week, Month
- Filter by clinician
- Filter by patient name
- Color-code by: Clinician, Visit Type, or Status
- Event click handling

## Dependencies

- @mantine/core
- @mantine/dates
- @tanstack/react-router
- dayjs

## Usage

```tsx
<ScheduleCalendar
  events={events}
  clinicians={clinicians}
  onEventClick={(event) => console.log(event)}
/>
```

## Event Types

- `CalendarEvent`: Contains id, title, patientName, clinicianName, visitType, start, end, status

## Filters

- `CalendarFilters`: clinicianId, patientName, view, colorBy
