import { TextField, InputAdornment } from "@mui/material";
import React from "react";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export function SearchBar({
  data,
  fields,
  placeholder = "Buscar...",
  onResults,
})  {
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();

    if (!query.trim()) {
      onResults(data, "");
      return;
    }

    const filtered = data.filter((item) =>
      fields.some((field) => {
        const value = String(item[field] ?? "").toLowerCase();
        return value.includes(query);
      })
    );

    onResults(filtered, query); 
  };


  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder}
      onChange={handleSearch}
      autoComplete="off"
      slotProps={{ htmlInput: { maxLength: 100 }, }}
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
