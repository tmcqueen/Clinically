import {
  Modal,
  Button,
  Group,
  Text,
  Stack,
  Badge,
  Box,
} from "@mantine/core";
import { IconAlertTriangle, IconArrowsExchange, IconClock, IconAlertCircle } from "@tabler/icons-react";
import dayjs from "dayjs";

export type ConflictResolutionOption = "cancel" | "swap" | "move-next" | "force";

export interface ConflictInfo {
  eventId: string;
  patientName: string;
  visitType: string;
  start: string;
  end: string;
  clinicianName: string;
}

export interface ConflictResolutionModalProps {
  opened: boolean;
  onClose: () => void;
  onResolve: (option: ConflictResolutionOption) => void;
  draggedEvent: {
    patientName: string;
    visitType: string;
    start: string;
    end: string;
  };
  conflictingEvent: ConflictInfo;
}

export function ConflictResolutionModal({
  opened,
  onClose,
  onResolve,
  draggedEvent,
  conflictingEvent,
}: ConflictResolutionModalProps) {
  const formatTime = (time: string) => dayjs(time).format("h:mm A");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconAlertTriangle size={20} color="orange" />
          <Text fw={600}>Scheduling Conflict</Text>
        </Group>
      }
      centered
      size="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          The target time slot conflicts with an existing appointment. Choose how to resolve this conflict:
        </Text>

        <Box p="md" style={{ backgroundColor: "#f8f9fa", borderRadius: 8 }}>
          <Text size="sm" fw={600} mb="xs">
            Dragged Appointment:
          </Text>
          <Group gap="xs">
            <Badge color="blue" size="sm">
              {draggedEvent.patientName}
            </Badge>
            <Text size="xs" c="dimmed">
              {draggedEvent.visitType}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            {formatTime(draggedEvent.start)} - {formatTime(draggedEvent.end)}
          </Text>
        </Box>

        <Box p="md" style={{ backgroundColor: "#fff5f5", borderRadius: 8, border: "1px solid #fed7d7" }}>
          <Text size="sm" fw={600} mb="xs" c="red">
            Conflicting Appointment:
          </Text>
          <Group gap="xs">
            <Badge color="red" size="sm">
              {conflictingEvent.patientName}
            </Badge>
            <Text size="xs" c="dimmed">
              {conflictingEvent.visitType}
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            {formatTime(conflictingEvent.start)} - {formatTime(conflictingEvent.end)}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            with {conflictingEvent.clinicianName}
          </Text>
        </Box>

        <Stack gap="xs">
          <Button
            variant="light"
            color="gray"
            fullWidth
            leftSection={<IconAlertTriangle size={18} />}
            onClick={() => onResolve("cancel")}
          >
            Cancel
          </Button>
          <Text size="xs" c="dimmed" ta="center">
            Return the dragged appointment to its original position
          </Text>
        </Stack>

        <Stack gap="xs">
          <Button
            variant="light"
            color="grape"
            fullWidth
            leftSection={<IconArrowsExchange size={18} />}
            onClick={() => onResolve("swap")}
          >
            Swap
          </Button>
          <Text size="xs" c="dimmed" ta="center">
            Exchange the two appointments (dragged goes to target, conflicting goes to original)
          </Text>
        </Stack>

        <Stack gap="xs">
          <Button
            variant="light"
            color="blue"
            fullWidth
            leftSection={<IconClock size={18} />}
            onClick={() => onResolve("move-next")}
          >
            Move Conflicting Next
          </Button>
          <Text size="xs" c="dimmed" ta="center">
            Move the conflicting appointment to the next available slot
          </Text>
        </Stack>

        <Stack gap="xs">
          <Button
            variant="filled"
            color="orange"
            fullWidth
            leftSection={<IconAlertCircle size={18} />}
            onClick={() => onResolve("force")}
          >
            Force Drop
          </Button>
          <Text size="xs" c="dimmed" ta="center">
            Overwrite the conflicting appointment (use with caution)
          </Text>
        </Stack>
      </Stack>
    </Modal>
  );
}
