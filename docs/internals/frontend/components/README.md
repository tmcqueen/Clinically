# Schedule Calendar Component

## Overview

Calendar component for viewing and managing clinic appointments with filtering and color-coding.

## Features

- Multiple views: Day, Week, Month
- Filter by clinician
- Filter by patient name
- Color-code by: Clinician, Visit Type, or Status
- Event click handling
- 24-hour day view with 15-minute intervals
- Current time indicator (red line, 40% opacity)
- Auto-scroll to current hour on load
- Real-time updates every 5 minutes

## Day View

- Time ruler on left (00:00 - 23:45 in 15-min intervals)
- Hour lines: solid, darker
- 30-min lines: medium weight
- 15-min lines: lighter/subtle
- Current time red line (horizontal, updates every 5 min)
- Scrollable Y container for full 24-hour view
- Auto-scroll to current hour on initial load

## Dependencies

- @mantine/core
- @mantine/dates
- @tanstack/react-router
- @tabler/icons-react
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
