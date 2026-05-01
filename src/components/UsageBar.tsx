import { Box, Flex, Text } from "@radix-ui/themes";
import React from "react";

interface UsageBarProps {
  value: number; // Utilization percentage (0–100)
  label: string; // Label for the bar (e.g., "CPU", "Memory", "Disk")
  compact?: boolean; // Whether to show in compact mode (for tables)
  max?: number; // Maximum value for the bar (e.g., total RAM, total disk space)
}

const UsageBar = React.memo(
  ({ value, label, compact = false, max = 100 }: UsageBarProps) => {
    // Ensure value is between 0 and 100
    const clampedValue = Math.min(Math.max(value, 0), max);

    // Determine color based on thresholds
    const getColor = (val: number) => {
      if (val >= 80) return "hot";
      if (val >= 50) return "warm";
      return "cool";
    };

    const barColor = getColor(clampedValue);

    if (compact) {
      return (
        <Box style={{ width: "100%" }}>
          <Box
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "var(--gray-5)",
              borderRadius: "3px",
              overflow: "hidden",
              marginBottom: "2px",
            }}
          >
            <div
              style={{
                height: "100%",
                background:
                  barColor === "hot"
                    ? "linear-gradient(90deg, #bc1023 0%, #581845 100%)"
                    : barColor === "warm"
                      ? "linear-gradient(90deg, #d88f24 0%, #d84824 100%)"
                      : "linear-gradient(90deg, #63b245 0%, #6dbf48 100%)",
                borderRadius: "3px",
                width: `${clampedValue}%`,
                transition: "width 0.5s ease-out",
              }}
            />
          </Box>
          <label color="gray" className="text-sm">
            {clampedValue.toFixed(1)}%
          </label>
        </Box>
      );
    }

    return (
      <Flex direction="column" gap="1" style={{ width: "100%" }}>
        <Flex justify="between" align="center">
          <Text size="2" color="gray">
            {label}
          </Text>
          <Text size="2" weight="bold" className="angel-bar-value">
            {Math.round(clampedValue)}%
          </Text>
        </Flex>
        <Box
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "var(--gray-5)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background:
                barColor === "hot"
                  ? "linear-gradient(90deg, #bc1023 0%, #581845 100%)"
                  : barColor === "warm"
                    ? "linear-gradient(90deg, #d88f24 0%, #d84824 100%)"
                    : "linear-gradient(90deg, #63b245 0%, #6dbf48 100%)",
              borderRadius: "4px",
              width: `${clampedValue}%`,
              transition: "width 0.5s ease-out",
            }}
          />
        </Box>
      </Flex>
    );
  },
);

export default UsageBar;
