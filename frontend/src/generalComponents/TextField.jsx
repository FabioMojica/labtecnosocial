import { TextField as MUITextField } from "@mui/material";


export const TextField = ({
  labelFontSize,
  variant= "standard",
  valueFontSize,
  sx,
  maxLength = 1,
  InputProps,
  InputLabelProps, 
  autoComplete = "new-field",
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
    <MUITextField 
      fullWidth
      variant={variant}
      inputProps={{
                ...props.inputProps, 
                autoComplete: autoComplete,
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
