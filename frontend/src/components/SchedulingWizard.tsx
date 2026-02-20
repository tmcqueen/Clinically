import { useState } from "react";
import {
  Paper,
  Title,
  Stepper,
  Button,
  Group,
  Select,
  Textarea,
  Stack,
  Grid,
  Alert,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { IconCheck, IconUser, IconCalendar, IconStethoscope } from "@tabler/icons-react";

export interface VisitDefinition {
  id: string;
  name: string;
  description: string;
  defaultDurationMinutes: number;
  color: string;
}

export interface SchedulingFormData {
  patientId: string;
  patientName: string;
  visitDefinitionId: string;
  clinicianId: string;
  scheduledTime: string | null;
  notes: string;
}

interface SchedulingWizardProps {
  visitDefinitions: VisitDefinition[];
  clinicians: { id: string; name: string }[];
  patients: { id: string; name: string }[];
  onSubmit: (data: SchedulingFormData) => void;
  onCancel: () => void;
}

export function SchedulingWizard({
  visitDefinitions,
  clinicians,
  patients,
  onSubmit,
  onCancel,
}: SchedulingWizardProps) {
  const [active, setActive] = useState(0);
  const [formData, setFormData] = useState<SchedulingFormData>({
    patientId: "",
    patientName: "",
    visitDefinitionId: "",
    clinicianId: "",
    scheduledTime: null,
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedVisit = visitDefinitions.find((v) => v.id === formData.visitDefinitionId);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.patientId) newErrors.patientId = "Patient is required";
    }

    if (step === 1) {
      if (!formData.visitDefinitionId) newErrors.visitDefinitionId = "Visit type is required";
    }

    if (step === 2) {
      if (!formData.clinicianId) newErrors.clinicianId = "Clinician is required";
    }

    if (step === 3) {
      if (!formData.scheduledTime) newErrors.scheduledTime = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(active)) {
      setActive((current) => Math.min(current + 1, 4));
    }
  };

  const prevStep = () => {
    setActive((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = () => {
    if (validateStep(active)) {
      onSubmit(formData);
    }
  };

  return (
    <Paper p="xl" withBorder>
      <Title order={2} mb="xl">
        Schedule Appointment
      </Title>

      <Stepper active={active} onStepClick={setActive} mb="xl">
        <Stepper.Step label="Patient" description="Select patient" icon={<IconUser size={18} />}>
          <Stack mt="md">
            <Select
              label="Patient"
              placeholder="Select patient"
              data={patients.map((p) => ({ value: p.id, label: p.name }))}
              value={formData.patientId}
              onChange={(value) => {
                const patient = patients.find((p) => p.id === value);
                setFormData({
                  ...formData,
                  patientId: value || "",
                  patientName: patient?.name || "",
                });
              }}
              error={errors.patientId}
              searchable
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Visit" description="Select visit type" icon={<IconStethoscope size={18} />}>
          <Stack mt="md">
            <Select
              label="Visit Type"
              placeholder="Select visit type"
              data={visitDefinitions.map((v) => ({
                value: v.id,
                label: `${v.name} (${v.defaultDurationMinutes} min)`,
              }))}
              value={formData.visitDefinitionId}
              onChange={(value) => {
                setFormData({
                  ...formData,
                  visitDefinitionId: value || "",
                });
              }}
              error={errors.visitDefinitionId}
            />
            {selectedVisit && (
              <Alert title={selectedVisit.name} color="blue">
                {selectedVisit.description || "No description available"}
                <br />
                <strong>Duration:</strong> {selectedVisit.defaultDurationMinutes} minutes
              </Alert>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Clinician" description="Choose provider" icon={<IconUser size={18} />}>
          <Stack mt="md">
            <Select
              label="Clinician"
              placeholder="Select clinician"
              data={clinicians.map((c) => ({ value: c.id, label: c.name }))}
              value={formData.clinicianId}
              onChange={(value) =>
                setFormData({ ...formData, clinicianId: value || "" })
              }
              error={errors.clinicianId}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Schedule" description="Pick date/time" icon={<IconCalendar size={18} />}>
          <Stack mt="md">
            <DateTimePicker
              label="Appointment Time"
              placeholder="Select date and time"
              value={formData.scheduledTime}
              onChange={(value) => setFormData({ ...formData, scheduledTime: value })}
              error={errors.scheduledTime}
              minDate={new Date()}
            />
            <Textarea
              label="Notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack mt="md">
            <Alert title="Confirm Appointment" color="green" icon={<IconCheck />}>
              <Grid>
                <Grid.Col span={6}>
                  <strong>Patient:</strong>
                </Grid.Col>
                <Grid.Col span={6}>{formData.patientName}</Grid.Col>

                <Grid.Col span={6}>
                  <strong>Visit Type:</strong>
                </Grid.Col>
                <Grid.Col span={6}>{selectedVisit?.name}</Grid.Col>

                <Grid.Col span={6}>
                  <strong>Clinician:</strong>
                </Grid.Col>
                <Grid.Col span={6}>
                  {clinicians.find((c) => c.id === formData.clinicianId)?.name}
                </Grid.Col>

                <Grid.Col span={6}>
                  <strong>Time:</strong>
                </Grid.Col>
                <Grid.Col span={6}>
                  {formData.scheduledTime?.toLocaleString()}
                </Grid.Col>
              </Grid>
            </Alert>
          </Stack>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={active === 0 ? onCancel : prevStep}>
          {active === 0 ? "Cancel" : "Back"}
        </Button>
        {active < 4 ? (
          <Button onClick={nextStep}>Next</Button>
        ) : (
          <Button onClick={handleSubmit} color="green">
            Confirm Booking
          </Button>
        )}
      </Group>
    </Paper>
  );
}
