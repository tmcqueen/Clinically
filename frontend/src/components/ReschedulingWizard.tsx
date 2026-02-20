import { useState } from "react";
import {
  Paper,
  Title,
  Button,
  Group,
  Stack,
  Select,
  Text,
  Badge,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconCalendar, IconAlertCircle } from "@tabler/icons-react";
import dayjs from "dayjs";

export interface Appointment {
  id: string;
  patientName: string;
  clinicianName: string;
  visitType: string;
  visitDuration: number;
  scheduledStart: string;
  scheduledEnd: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

interface ReschedulingWizardProps {
  appointment: Appointment;
  clinicians: { id: string; name: string }[];
  onReschedule: (newTime: string, clinicianId: string) => void;
  onCancel: () => void;
}

interface SuggestedTime {
  date: string;
  clinicianId: string;
  clinicianName: string;
}

export function ReschedulingWizard({
  appointment,
  clinicians,
  onReschedule,
  onCancel,
}: ReschedulingWizardProps) {
  const [mode, setMode] = useState<"wizard" | "drag">("wizard");
  const [selectedSlot, setSelectedSlot] = useState<SuggestedTime | null>(null);
  const [customDate, setCustomDate] = useState<string | null>(null);
  const [selectedClinician, setSelectedClinician] = useState<string | null>(null);

  const generateSuggestions = (): SuggestedTime[] => {
    const suggestions: SuggestedTime[] = [];
    const baseDate = dayjs(appointment.scheduledStart);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = baseDate.add(dayOffset, "day");
      
      for (let hour = 8; hour < 17; hour++) {
        for (const clinician of clinicians) {
          const start = date.hour(hour).minute(0);
          
          if (dayOffset > 0 || start.isAfter(dayjs())) {
            suggestions.push({
              date: start.format("YYYY-MM-DDTHH:mm:ss"),
              clinicianId: clinician.id,
              clinicianName: clinician.name,
            });
          }
        }
      }
    }

    return suggestions.slice(0, 9);
  };

  const suggestions = generateSuggestions();

  const handleConfirm = () => {
    if (selectedSlot) {
      onReschedule(selectedSlot.date, selectedSlot.clinicianId);
    } else if (customDate && selectedClinician) {
      onReschedule(customDate, selectedClinician);
    }
  };

  return (
    <Paper p="xl" withBorder>
      <Title order={2} mb="md">
        Reschedule Appointment
      </Title>

      <Alert title="Current Appointment" color="blue" mb="lg" icon={<IconCalendar />}>
        <Text><strong>Patient:</strong> {appointment.patientName}</Text>
        <Text><strong>Visit:</strong> {appointment.visitType}</Text>
        <Text><strong>Time:</strong> {dayjs(appointment.scheduledStart).format("MMM D, YYYY h:mm A")}</Text>
        <Text><strong>Clinician:</strong> {appointment.clinicianName}</Text>
      </Alert>

      <Group mb="lg">
        <Button
          variant={mode === "wizard" ? "filled" : "outline"}
          onClick={() => setMode("wizard")}
        >
          Wizard
        </Button>
        <Button
          variant={mode === "drag" ? "filled" : "outline"}
          onClick={() => setMode("drag")}
        >
          Drag & Drop
        </Button>
      </Group>

      {mode === "wizard" && (
        <>
          <Title order={4} mb="md">Suggested Times</Title>
          <Text size="sm" c="dimmed" mb="md">
            Based on {appointment.visitType} ({appointment.visitDuration} min)
          </Text>

          <SimpleGrid cols={3} mb="lg">
            {suggestions.map((slot, index) => (
              <Paper
                key={index}
                p="sm"
                withBorder
                style={{
                  cursor: "pointer",
                  borderColor: selectedSlot?.date === slot.date ? "blue" : undefined,
                  backgroundColor: selectedSlot?.date === slot.date ? "lightblue" : undefined,
                }}
                onClick={() => setSelectedSlot(slot)}
              >
                <Group justify="space-between">
                  <Text size="sm">{dayjs(slot.date).format("MMM D")}</Text>
                  <Badge size="sm">{dayjs(slot.date).format("h:mm A")}</Badge>
                </Group>
                <Text size="xs" c="dimmed">{slot.clinicianName}</Text>
              </Paper>
            ))}
          </SimpleGrid>

          <Title order={4} mb="md">Or Choose Custom Time</Title>
          <Stack>
            <Select
              label="Clinician"
              placeholder="Select clinician"
              data={clinicians.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedClinician}
              onChange={setSelectedClinician}
            />
            <DateTimePicker
              label="New Time"
              placeholder="Select date and time"
              value={customDate}
              onChange={setCustomDate}
              minDate={new Date()}
            />
          </Stack>
        </>
      )}

      {mode === "drag" && (
        <Alert title="Drag & Drop" color="orange" icon={<IconAlertCircle />}>
          Drag and drop interface coming soon. Use the wizard for now.
        </Alert>
      )}

      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!selectedSlot && (!customDate || !selectedClinician)}
          color="green"
        >
          Confirm Reschedule
        </Button>
      </Group>
    </Paper>
  );
}
