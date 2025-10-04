import React, { useState } from "react";
import {
  TextField,
  FormHelperText,
  Box,
  IconButton,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";


export const TextFieldWithError = ({
  label,
  value,
  onChange,
  errorMessage,
  className = "",
  autoC = false,
  fullWidth = true,
  variant = "standard",
  type = "text",
  maxLength = 1,
  ...props
}) => {
  const theme = useTheme();

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => setShowPassword((prev) => !prev);
  const isPasswordField = type === "password";

  return (
    <Box sx={{ mb: 2, width: "100%" }} className={className}>
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        autoComplete={autoC ? "on" : "off"} 
        type={isPasswordField && showPassword ? "text" : type}
        fullWidth={fullWidth}
        error={Boolean(errorMessage)}
        variant={variant}
        slotProps={{
          htmlInput: { maxLength },
          input: isPasswordField
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            : undefined,
        }}
        sx={{
          width: "100%",
          '& input:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 1000px ${theme.palette.primary.backgroundBox} inset`,
            WebkitTextFillColor: theme.palette.text.primary,
            transition: 'background-color 5000s ease-in-out',
          },
        }} 
        {...props}
      />

      {errorMessage && (
        <FormHelperText sx={{ color: "error.main", mt: 0.5 }}>
          {errorMessage}
        </FormHelperText>
      )}
    </Box>
  );
};


