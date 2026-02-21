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

export interface TimeSlot {
  providerId: string;
  startMinutes: number;
  endMinutes: number;
}

export interface DropZone {
  providerId: string;
  startMinutes: number;
  endMinutes: number;
  isValid: boolean;
}

export interface DragState {
  isDragging: boolean;
  activeEvent: CalendarEvent | null;
  snapPosition: number | null;
  targetProviderId: string | null;
  originalProviderId: string | null;
  originalStartMinutes: number | null;
  originalEndMinutes: number | null;
}

export function snapToQuarterHour(minutes: number): number {
  return Math.round(minutes / QUARTER_HOUR_MINUTES) * QUARTER_HOUR_MINUTES;
}

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

  const firstStart = timeToMinutes(dayAppointments[0].start);
  if (firstStart > 0) {
    dropZones.push({
      providerId,
      startMinutes: 0,
      endMinutes: firstStart,
      isValid: true,
    });
  }

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

export function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:00`;
}

export function getAppointmentDuration(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

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

export function getDropZoneDuration(zone: DropZone): number {
  return zone.endMinutes - zone.startMinutes;
}
