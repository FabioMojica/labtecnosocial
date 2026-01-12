import { TextField as MUITextField } from "@mui/material";

export const TextField = ({
  labelFontSize,
  variant = "standard",
  valueFontSize,
  sx,
  maxLength,
  InputProps,
  InputLabelProps,
  autoComplete = "off",
  ...props
}) => {
  const defaultSx = {
    '& .MuiInputLabel-root': {
      fontSize: { xs: '0.9rem', sm: '0.9rem', md: '1rem' },
      ...(labelFontSize ? { fontSize: labelFontSize } : {}),
    },
    '& .MuiInputBase-input': {
      fontSize: { xs: '0.9rem', sm: '2rem', md: '2.5rem' },
      ...(valueFontSize ? { fontSize: valueFontSize } : {}),
    },
  };

  return (
    <form autoComplete="off">
      <MUITextField
        {...props}
        fullWidth
        variant={variant}
        autoComplete="new-email"
        inputProps={{
          autoComplete: autoComplete,
          spellCheck: false,
          autoCorrect: "off",
          autoCapitalize: "off",
          inputMode: "text",
          ...(maxLength ? { maxLength } : {}),
          ...props.inputProps,
        }}
        InputProps={InputProps}
        InputLabelProps={InputLabelProps}
        sx={{ ...defaultSx, ...sx }}
      />
    </form>
  );
};
