import React from "react";
import { TextField as MUITextField } from "@mui/material";

export const TextFieldMultiline = ({
    rows = 4,
    variant="standard",
    multiline = true,
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
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
            ...(labelFontSize ? { fontSize: labelFontSize } : {}),
        },
        '& .MuiInputBase-input': {
            fontSize: { xs: '0.9rem', sm: '2rem', md: '2rem' },
        },
    };

    return (
        <MUITextField
            fullWidth
            multiline={multiline}
            rows={rows}
            variant={variant}
            InputProps={{ ...InputProps }}
            inputProps={{
                ...props.inputProps,
                autoComplete: "off",
                spellCheck: false,
                ...(maxLength ? { maxLength } : {}),
            }}
            InputLabelProps={{ ...InputLabelProps }}
            sx={{ ...defaultSx, ...sx }}
            {...props}
        />
    );
};
