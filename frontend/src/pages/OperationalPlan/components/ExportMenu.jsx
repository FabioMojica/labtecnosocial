import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const ExportMenu = ({ onExportExcel, onExportPDF }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExportExcel = () => {
    onExportExcel();
    handleClose();
  };

  const handleExportPDF = () => {
    onExportPDF();
    handleClose();
  };

  return (
    <>
      <Tooltip title="Exportar">
        <IconButton
          aria-controls={anchorEl ? 'export-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={anchorEl ? 'true' : undefined}
          onClick={handleClick}
          size="small"
          aria-label="exportar"
        >
          <FileDownloadIcon />
        </IconButton>
      </Tooltip>

      <Menu
        id="export-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleExportExcel}>Exportar a Excel</MenuItem>
        <MenuItem onClick={handleExportPDF}>Exportar a PDF</MenuItem>
      </Menu>
    </>
  );
};

export default ExportMenu;
