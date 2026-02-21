export const HOUR_HEIGHT = 120;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const TOTAL_HOURS = 24;
export const TIME_COLUMN_WIDTH = 60;
export const MIN_COLUMN_WIDTH = 180;
export const MAX_VISIBLE_COLUMNS = 5;
export const SCROLL_ARROW_WIDTH = 30;
export const QUARTER_HOURS = [0, 15, 30, 45];
export const QUARTER_HOUR_MINUTES = 15;

export interface PositionedEvent {
  id: string;
  title: string;
  patientName: string;
  clinicianId: string;
  visitType: string;
  start: string;
  end: string;
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled";
  colorBy: "clinician" | "visit-type" | "status";
}

export interface Employee {
  id: string;
  displayName: string;
  credentials: string;
  type: string;
}

export type CalendarEvent = PositionedEvent;

// Time slot - available opening for a provider
export interface TimeSlot {
  providerId: string;
  startMinutes: number; // minutes from midnight
  endMinutes: number;
}

// Drop zone - a valid drop target during drag
export interface DropZone {
  providerId: string;
  startMinutes: number;
  endMinutes: number;
  isValid: boolean;
}

// Drag state for tracking drag operations
export interface DragState {
  isDragging: boolean;
  activeEvent: CalendarEvent | null;
  snapPosition: number | null; // minutes from midnight
  targetProviderId: string | null;
  originalProviderId: string | null;
  originalStartMinutes: number | null;
  originalEndMinutes: number | null;
}

// Snap minutes to nearest quarter hour boundary
export function snapToQuarterHour(minutes: number): number {
  return Math.round(minutes / QUARTER_HOUR_MINUTES) * QUARTER_HOUR_MINUTES;
}

// Calculate drop zones for a provider given their appointments
export function calculateDropZones(
  appointments: CalendarEvent[],
  providerId: string,
  date: string
): DropZone[] {
  const dayAppointments = appointments
    .filter(
      (apt) =>
        apt.clinicianId === providerId &&
        apt.start.startsWith(date)
    )
    .sort((a, b) => a.start.localeCompare(b.start));

  if (dayAppointments.length === 0) {
    // No appointments - full day is available
    return [
      {
        providerId,
        startMinutes: 0,
        endMinutes: TOTAL_HOURS * 60,
        isValid: true,
      },
    ];
  }

  const dropZones: DropZone[] = [];

  // Before first appointment
  const firstStart = timeToMinutes(dayAppointments[0].start);
  if (firstStart > 0) {
    dropZones.push({
      providerId,
      startMinutes: 0,
      endMinutes: firstStart,
      isValid: true,
    });
  }

  // Between appointments
  for (let i = 0; i < dayAppointments.length - 1; i++) {
    const currentEnd = timeToMinutes(dayAppointments[i].end);
    const nextStart = timeToMinutes(dayAppointments[i + 1].start);

    if (nextStart > currentEnd) {
      dropZones.push({
        providerId,
        startMinutes: currentEnd,
        endMinutes: nextStart,
        isValid: true,
      });
    }
  }

  // After last appointment
  const lastEnd = timeToMinutes(dayAppointments[dayAppointments.length - 1].end);
  if (lastEnd < TOTAL_HOURS * 60) {
    dropZones.push({
      providerId,
      startMinutes: lastEnd,
      endMinutes: TOTAL_HOURS * 60,
      isValid: true,
    });
  }

  return dropZones;
}

// Convert time string (HH:mm:ss) to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

// Convert minutes from midnight to time string
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
}

// Calculate appointment duration in minutes
export function getAppointmentDuration(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

// Check if a position is within a drop zone
export function isWithinDropZone(
  positionMinutes: number,
  dropZones: DropZone[]
): DropZone | null {
  for (const zone of dropZones) {
    if (positionMinutes >= zone.startMinutes && positionMinutes < zone.endMinutes) {
      return zone;
    }
  }
  return null;
}

// Get duration of a drop zone in minutes
export function getDropZoneDuration(zone: DropZone): number {
  return zone.endMinutes - zone.startMinutes;
}
