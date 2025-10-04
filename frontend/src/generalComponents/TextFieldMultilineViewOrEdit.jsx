// TextFieldMultilineViewOrEdit.tsx
import React, { useState, useRef } from "react";
import { TextField } from "@mui/material";


export const TextFieldMultilineViewOrEdit = ({
  label = "Descripción",
  rows = 4,
  variant="standard",
  multiline = true,
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
      ...(labelFontSize ? { fontSize: labelFontSize } : {}),
    },
    '& .MuiInputBase-input': {
      fontSize: { xs: '0.9rem', sm: '2rem', md: '2rem' },
      cursor: isEditing ? 'text' : 'pointer',
    },
  };

  return (
    <TextField
      fullWidth
      label={label}
      multiline={multiline}
      rows={rows}
      variant={variant}
      inputRef={inputRef}
      value={value}
      onChange={propOnChange}
      onDoubleClick={handleDoubleClick}
      inputProps={{
        ...props.inputProps,
        maxLength: 300, 
      }}
      InputProps={{
        ...InputProps,
        readOnly: !isEditing,
      }}
      sx={{ ...defaultSx, ...sx }}
      InputLabelProps={{ ...InputLabelProps }}
      {...props}
    />
  );
};
