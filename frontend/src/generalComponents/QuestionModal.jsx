import { Box, Button, Modal, Typography, useTheme } from "@mui/material";

export const QuestionModal = ({ open, question, onConfirm, onCancel }) => {
    const theme = useTheme();

  return (
    <Modal open={open} onClose={onCancel}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: `${theme.palette.primary.backgroundModal}`,

          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          minWidth: 300,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6">{question}</Typography>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={onConfirm}>
            Aceptar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};
