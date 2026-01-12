
import { FormControl, MenuItem, Select, Box, Typography, InputLabel } from "@mui/material";
import { useState } from "react";

export const SelectComponent = ({
  label,
  options,
  value,
  onChange,
  sx = {},
  fullWidth = true,
  height = "74%",
  optionFontSize = "1rem", 
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
    <FormControl 
      sx={{ width: fullWidth ? "100%" : "auto", height, ...sx }}
    >
      <InputLabel id="select-label">{label ? label : null}</InputLabel>
      <Select
        value={String(value ?? internalValue)}
        onChange={handleChange}
        label={label ? label : null}
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center", 
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center", 
          },
        }}
      >
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <MenuItem 
              key={option.value} 
              value={String(option.value)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {Icon && <Icon sx={{ color: option.color ?? "inherit" }} />}
                <Typography sx={{ fontSize: optionFontSize }}>{option.label}</Typography>
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};
