import { memo, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { TextField } from "@mui/material";

export const ReportTitle = memo(({ value, onSave }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const debouncedSave = useRef(
        debounce((val) => {
            onSave(val);
        }, 300)
    ).current;

    useEffect(() => {
        return () => debouncedSave.cancel();
    }, [debouncedSave]);

    return (
        <TextField

            fullWidth
            type="text"
            variant="outlined"
            value={localValue}
            onChange={(e) => {
                setLocalValue(e.target.value);
                debouncedSave(e.target.value);
            }}
            placeholder="Escribe un título para tu reporte"
            slotProps={{
                htmlInput: {
                    maxLength: 100
                }
            }}
            sx={{
                '& .MuiOutlinedInput-root': {
                    minHeight: {
                        xs: 35,
                        sm: 35
                    },
                    maxHeight: {
                        xs: 35,
                        sm: 35
                    },
                    width: '100%',
                },
                '& .MuiOutlinedInput-input': {
                    padding: '0px 12px',
                    fontSize: '0.95rem',
                    lineHeight: '1',
                },
            }}
        />

    );
});
