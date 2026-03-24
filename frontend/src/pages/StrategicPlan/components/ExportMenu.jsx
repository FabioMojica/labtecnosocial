import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const ExportMenu = ({ onExportPDF, onExportDOCX, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleExportPDF = () => {
    onExportPDF?.();
    handleClose();
  };

  const handleExportDOCX = () => {
    onExportDOCX?.();
    handleClose();
  };

  return (
    <>
      <Tooltip title="Exportar">
        <IconButton
          aria-controls={anchorEl ? "export-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={Boolean(anchorEl)}
          onClick={handleClick}
          size="small"
          aria-label="exportar"
          disabled={disabled}
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
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleExportPDF} disabled={disabled}>Exportar en PDF</MenuItem>
        <MenuItem onClick={handleExportDOCX} disabled={disabled}>Exportar en DOCX</MenuItem>
      </Menu>
    </>
  );
};

export default ExportMenu;
