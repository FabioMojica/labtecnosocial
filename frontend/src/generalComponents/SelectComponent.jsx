
import { FormControl, MenuItem, Select, Box, Typography } from "@mui/material";
import { useState } from "react";

export const SelectComponent = ({
  options,
  value,
  onChange,
  sx = {},
  fullWidth = true,
  height = "74%",
}) => {
  const [internalValue, setInternalValue] = useState(value ?? "");

  const handleChange = (event) => {
    const rawValue = event.target.value;
    const option = options.find((o) => String(o.value) === rawValue);
    const newValue = option ? option.value : rawValue;

    setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <FormControl sx={{ width: fullWidth ? "100%" : "auto", height, ...sx }}>
      <Select
        value={String(value ?? internalValue)}
        onChange={handleChange}
        sx={{ width: "100%", height: "100%" }}
      >
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <MenuItem key={option.value} value={String(option.value)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {Icon && <Icon sx={{ color: option.color ?? "inherit" }} />}
                <Typography>{option.label}</Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
