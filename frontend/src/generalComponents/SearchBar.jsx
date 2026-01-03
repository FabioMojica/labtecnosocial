import { TextField, InputAdornment } from "@mui/material";
import React, { useState, useEffect } from "react";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export function SearchBar({
  data,
  fields,
  placeholder = "Buscar...",
  onResults,
})  {
  const [query, setQuery] = useState("");

  // Debounce: solo filtra 300ms después de que el usuario deja de escribir
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!query.trim()) {
        onResults(data, "");
        return;
      }

      const filtered = data.filter((item) =>
        fields.some((field) => {
          const value = String(item[field] ?? "").toLowerCase();
          return value.includes(query.toLowerCase());
        })
      );

      onResults(filtered, query);
    }, 300);

    return () => clearTimeout(handler); 
  }, [query, data, fields, onResults]);

  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      autoComplete="off"
      slotProps={{ htmlInput: { maxLength: 100 } }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon />
          </InputAdornment>
        ),
      }}
      sx={{ width: "100%", height: "100%" }}
    />
  );
}
