import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

export const RealTimeClock = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const formatter = new Intl.DateTimeFormat("es-BO", {
        timeZone: "America/La_Paz",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTime(formatter.format(new Date()));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => clearInterval(interval);
  }, []); 

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h2">{time}</Typography>
    </Box>
  );
}
