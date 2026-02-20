import { useState } from "react";
import {
  Paper,
  Title,
  Stepper,
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
  Grid,
  Select,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconUser, IconPhone, IconShieldCheck } from "@tabler/icons-react";

export interface PatientIntakeData {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  phone: string;
  email: string;
  address: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  medicalHistory: string;
  medications: string;
  allergies: string;
}

interface PatientIntakeWizardProps {
  onSubmit: (data: PatientIntakeData) => void;
  onCancel: () => void;
}

export function PatientIntakeWizard({ onSubmit, onCancel }: PatientIntakeWizardProps) {
  const [active, setActive] = useState(0);
  const [formData, setFormData] = useState<PatientIntakeData>({
    firstName: "",
    lastName: "",
    dateOfBirth: null,
    phone: "",
    email: "",
    address: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    medicalHistory: "",
    medications: "",
    allergies: "",
  });

  const updateField = (field: keyof PatientIntakeData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateStep = (step: number): boolean => {
    if (step === 0) {
      return !!(formData.firstName && formData.lastName && formData.dateOfBirth);
    }
    if (step === 1) {
      return !!(formData.phone && formData.email);
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(active)) {
      setActive((current) => Math.min(current + 1, 3));
    }
  };

  const prevStep = () => {
    setActive((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <Paper p="xl" withBorder>
      <Title order={2} mb="xl">
        New Patient Intake
      </Title>

      <Stepper active={active} onStepClick={setActive} mb="xl">
        <Stepper.Step label="Personal" description="Basic information" icon={<IconUser size={18} />}>
          <Stack mt="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </Grid.Col>
            </Grid>
            <DateInput
              label="Date of Birth"
              required
              value={formData.dateOfBirth}
              onChange={(value) => updateField("dateOfBirth", value || "")}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Contact" description="Contact details" icon={<IconPhone size={18} />}>
          <Stack mt="md">
            <TextInput
              label="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
            <TextInput
              label="Email"
              required
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <Textarea
              label="Address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={3}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Insurance" description="Insurance information" icon={<IconShieldCheck size={18} />}>
          <Stack mt="md">
            <Select
              label="Insurance Provider"
              placeholder="Select provider"
              data={[
                "Blue Cross Blue Shield",
                "Aetna",
                "Cigna",
                "United Healthcare",
                "Medicare",
                "Medicaid",
                "Self Pay",
                "Other",
              ]}
              value={formData.insuranceProvider}
              onChange={(value) => updateField("insuranceProvider", value || "")}
            />
            <TextInput
              label="Policy Number"
              value={formData.insurancePolicyNumber}
              onChange={(e) => updateField("insurancePolicyNumber", e.target.value)}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Medical" description="Medical history" icon={<IconShieldCheck size={18} />}>
          <Stack mt="md">
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Emergency Contact Name"
                  value={formData.emergencyContactName}
                  onChange={(e) => updateField("emergencyContactName", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Relationship"
                  data={["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"]}
                  value={formData.emergencyContactRelationship}
                  onChange={(value) => updateField("emergencyContactRelationship", value || "")}
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="Emergency Contact Phone"
              value={formData.emergencyContactPhone}
              onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
            />
            <Textarea
              label="Medical History"
              placeholder="Any chronic conditions, past surgeries, etc."
              value={formData.medicalHistory}
              onChange={(e) => updateField("medicalHistory", e.target.value)}
              rows={3}
            />
            <Textarea
              label="Current Medications"
              placeholder="List all medications with dosages"
              value={formData.medications}
              onChange={(e) => updateField("medications", e.target.value)}
              rows={2}
            />
            <Textarea
              label="Allergies"
              placeholder="List any known allergies"
              value={formData.allergies}
              onChange={(e) => updateField("allergies", e.target.value)}
              rows={2}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Stack mt="md">
            <Paper p="md" bg="green.1">
              <Title order={4}>Review Information</Title>
              <Grid mt="md">
                <Grid.Col span={6}>
                  <strong>Name:</strong> {formData.firstName} {formData.lastName}
                </Grid.Col>
                <Grid.Col span={6}>
                  <strong>DOB:</strong> {formData.dateOfBirth}
                </Grid.Col>
                <Grid.Col span={6}>
                  <strong>Phone:</strong> {formData.phone}
                </Grid.Col>
                <Grid.Col span={6}>
                  <strong>Email:</strong> {formData.email}
                </Grid.Col>
                <Grid.Col span={6}>
                  <strong>Insurance:</strong> {formData.insuranceProvider}
                </Grid.Col>
                <Grid.Col span={6}>
                  <strong>Policy #:</strong> {formData.insurancePolicyNumber}
                </Grid.Col>
              </Grid>
            </Paper>
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
            Complete Registration
          </Button>
        )}
      </Group>
    </Paper>
  );
}
