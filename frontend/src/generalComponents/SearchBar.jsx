import { TextField, InputAdornment, IconButton } from "@mui/material";
import React, { useState, useEffect } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

export function SearchBar({
  data,
  fields,
  placeholder = "Buscar...",
  onResults,
  sx,
}) {
  const [query, setQuery] = useState("");

  // Debounce
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

  const handleClear = () => {
    setQuery("");
    onResults(data, "");
  };

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
            {query ? (
              <IconButton
                size="small"
                onClick={handleClear}
                edge="start"
              >
                <ClearRoundedIcon />
              </IconButton>
            ) : (
              <SearchRoundedIcon />
            )}
          </InputAdornment>
        ),
      }}
      sx={{ width: "100%", height: "100%", ...sx }}
    />
  );
}
