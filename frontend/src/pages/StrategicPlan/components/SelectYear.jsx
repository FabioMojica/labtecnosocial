import { useEffect, useState } from "react";
import { Box, Button, Modal, Grid, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const years = Array.from({ length: 3000 - 2000 + 1 }, (_, i) => 2000 + i);
const YEARS_PER_PAGE = 16;

export const SelectYear = ({ selectedYear, onChange }) => {

  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(0);
  useEffect(() => {
    if (selectedYear) {
      const index = years.indexOf(selectedYear);
      if (index >= 0) {
        setPage(Math.floor(index / YEARS_PER_PAGE));
      }
    }
  }, [selectedYear]);


  const handleSelect = (year) => {
    onChange(year);
    setOpen(false);
  };

  const startIndex = page * YEARS_PER_PAGE;
  const currentYears = years.slice(startIndex, startIndex + YEARS_PER_PAGE);

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if ((page + 1) * YEARS_PER_PAGE < years.length) setPage(page + 1);
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)} sx={{ width: 'auto', fontSize: '1rem' }}>
        {selectedYear}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 400 },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <IconButton onClick={handlePrevPage} disabled={page === 0}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <Typography variant="h6">Selecciona un año</Typography>
            <IconButton
              onClick={handleNextPage}
              disabled={(page + 1) * YEARS_PER_PAGE >= years.length}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>

          <Grid container spacing={1}>
            {currentYears.map((year) => (
              <Grid size={3} key={year}>
                <Button
                  fullWidth
                  variant={year === selectedYear ? "contained" : "outlined"}
                  onClick={() => handleSelect(year)}
                >
                  {year}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Modal>
    </>
  );
};
