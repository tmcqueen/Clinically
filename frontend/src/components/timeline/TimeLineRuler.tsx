import { Box, Text } from "@mantine/core";
import { HOUR_HEIGHT, TOTAL_HOURS } from "./TimeLineBase";

interface TimeLineRulerProps {
  showCurrentTime?: boolean;
  currentTimePosition?: number;
}

export function TimeLineRuler({ showCurrentTime = false, currentTimePosition = 0 }: TimeLineRulerProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i);

  return (
    <Box
      style={{
        width: 60,
        flexShrink: 0,
        position: "relative",
        backgroundColor: "#fafafa",
        borderRight: "1px solid #ddd",
      }}
    >
      {hours.map((hour) => (
        <Box
          key={hour}
          style={{
            height: HOUR_HEIGHT,
            borderBottom: "1px solid #eee",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            paddingRight: 8,
            paddingTop: 2,
          }}
        >
          <Text size="xs" c="dimmed">
            {hour.toString().padStart(2, "0")}:00
          </Text>
        </Box>
      ))}
      
      {showCurrentTime && (
        <Box
          style={{
            position: "absolute",
            top: currentTimePosition,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: "rgba(255, 0, 0, 0.4)",
            zIndex: 10,
            pointerEvents: "none",
          }}
        />
      )}
    </Box>
  );
}

export function TimeLineRulerHeader() {
  return (
    <Box
      style={{
        width: 60,
        flexShrink: 0,
        backgroundColor: "#f5f5f5",
        borderRight: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text size="xs" fw={600}>Time</Text>
    </Box>
  );
}
