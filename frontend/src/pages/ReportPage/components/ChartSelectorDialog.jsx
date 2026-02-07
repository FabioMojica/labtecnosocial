// ChartSelectorDialog.jsx
import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
} from "@mui/material";
import { APIsDashboardPage } from "../../APIsDashboardPage";
import { useReport } from "../../../contexts";

export const ChartSelectorDialog = ({ open, onClose, onAcept }) => {
  const { selectedCharts, clearCharts } = useReport();

  const theme = useTheme();

  const handleAccept = () => {
    onAcept();
    onClose();
  };

  const handleCancel = () => {
    clearCharts();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      fullScreen
    >
      <DialogTitle sx={{
        p: 1
      }}>
        Seleccionar gráficos
      </DialogTitle>

      <DialogContent dividers sx={{
        p:0,
        overflowY: 'auto',
        "&::-webkit-scrollbar": { height: "2px", width: "2px" },
        "&::-webkit-scrollbar-track": {
          backgroundColor: theme.palette.background.default,
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: theme.palette.primary.main,
          borderRadius: "2px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: theme.palette.primary.dark,
        },
      }}>
        <APIsDashboardPage
          showingDialog={true}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          Cancelar
        </Button>
        <Button 
          onClick={handleAccept}
          variant="contained"
          disabled={selectedCharts?.length === 0}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
