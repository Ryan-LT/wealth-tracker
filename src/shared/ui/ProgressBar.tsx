"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

import { cn } from "@/shared/lib";

type ProgressBarProps = {
  value: number;
  max?: number;
  tone?: "secondary" | "error";
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  tone = "secondary",
  className,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <Box className={cn("w-full", className)}>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={tone === "secondary" ? "secondary" : "error"}
        sx={{
          height: 8,
          borderRadius: "9999px",
          bgcolor: "var(--color-surface-container-highest)",
          "& .MuiLinearProgress-bar": {
            borderRadius: "9999px",
          },
        }}
      />
    </Box>
  );
}
