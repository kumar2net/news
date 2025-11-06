import * as React from "react";
import { Chip, Stack } from "@mui/material";

const OPTIONS = [
  { value: "ir", label: "Domestic (IR)", emoji: "🇮🇷" },
  { value: "global", label: "Global", emoji: "🌍" },
  { value: "mixed", label: "Mixed", emoji: "⚖️" },
];

export default function PerspectiveToggle({ value = "mixed", onChange, disabled = false }) {
  const handleSelect = (optionValue) => {
    if (optionValue === value) return;
    onChange?.(optionValue);
  };

  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Chip
            key={option.value}
            label={`${option.emoji} ${option.label}`}
            onClick={() => handleSelect(option.value)}
            color={selected ? "primary" : "default"}
            variant={selected ? "filled" : "outlined"}
            disabled={disabled}
            sx={{
              fontWeight: selected ? 600 : 500,
              px: 1.5,
              borderRadius: 999,
              transition: (theme) =>
                theme.transitions.create(["background-color", "color"], {
                  duration: theme.transitions.duration.short,
                }),
            }}
          />
        );
      })}
    </Stack>
  );
}
