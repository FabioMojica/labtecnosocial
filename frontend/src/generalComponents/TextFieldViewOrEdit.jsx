// TextFieldViewOrEdit.tsx
import React, { useState, useRef } from "react";
import { TextField } from "@mui/material";

export const TextFieldViewOrEdit = ({
  label = "Título",
  disabled,
  variant="standard",
  labelFontSize,
  valueFontSize,
  sx,
  InputProps,
  InputLabelProps,
  value,
  onChange: propOnChange,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const defaultSx = {
    '& .MuiInputLabel-root': {
      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
      ...(typeof labelFontSize !== 'undefined' ? { fontSize: labelFontSize } : {}),
    },
    '& .MuiInputBase-input': {
      fontSize: { xs: '0.9rem', sm: '2rem', md: '3rem' },
      ...(typeof valueFontSize !== 'undefined' ? { fontSize: valueFontSize } : {}),
      cursor: isEditing ? 'text' : 'pointer',
    },
  };

  return (
    <TextField
      fullWidth
      label={label}
      variant={variant}
      value={value}
      inputRef={inputRef}
      inputProps={{
        ...props.inputProps,
        maxLength: 50, 
        autoComplete: "off",
      }}
      InputProps={{
        ...InputProps,
        readOnly: !isEditing,
      }}
      onDoubleClick={handleDoubleClick}
      onChange={propOnChange}
      sx={{ ...defaultSx, ...sx }}
      InputLabelProps={{ ...InputLabelProps }}
      {...props}
    />
  );
};
