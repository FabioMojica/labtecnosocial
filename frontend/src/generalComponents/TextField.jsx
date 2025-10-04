// TextField.tsx
import React from "react";
import { TextField as MUITextField } from "@mui/material";


export const TextField = ({
  labelFontSize,
  valueFontSize,
  sx,
  maxLength = 1,
  InputProps,
  InputLabelProps, 
  ...props
}) => {
  const defaultSx = {
    '& .MuiInputLabel-root': {
      fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.2rem' },
      ...(labelFontSize ? { fontSize: labelFontSize } : {}),
    },
    '& .MuiInputBase-input': {
      fontSize: { xs: '0.9rem', sm: '2rem', md: '3rem' },
      ...(valueFontSize ? { fontSize: valueFontSize } : {}),
    },
  };
 
  return (
    <MUITextField
      fullWidth
      variant="standard"
      inputProps={{
                ...props.inputProps,
                autoComplete: "off",
                spellCheck: false,
                ...(maxLength ? { maxLength } : {}),
            }}
      InputProps={{ ...InputProps }}
      InputLabelProps={{ ...InputLabelProps }}
      sx={{ ...defaultSx, ...sx }}
      {...props}
    />
  );
};
