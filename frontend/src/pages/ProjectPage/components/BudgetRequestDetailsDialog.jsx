import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { formatDateParts } from "../../../utils";

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export const BudgetRequestDetailsDialog = ({ open, onClose, request, isSuperAdmin, onOpenUserProfile }) => {
  if (!request) return null;

  const { date, time } = formatDateParts(request.created_at);
  const totalFormatted = Number(request.total_amount || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Detalle de la solicitud
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Fecha de solicitud
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {date} {time}
            </Typography>
          </Box>

          {isSuperAdmin && request.requested_by && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Solicitante
              </Typography>
              <Link
                component="button"
                underline="hover"
                color="inherit"
                fontWeight="bold"
                onClick={() => onOpenUserProfile?.(request.requested_by)}
              >
                {request.requested_by.email}
              </Link>
            </Box>
          )}

          <Box>
            <Typography variant="body2" color="text.secondary">
              Objetivo
            </Typography>
            <Typography variant="body1">{request.objective}</Typography>
          </Box>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Paper elevation={2} sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Estado
              </Typography>
              <Chip
                size="small"
                color={statusColorMap[request.status] || "default"}
                label={request.status_label}
                sx={{ mt: 0.75, fontWeight: "bold" }}
              />
            </Paper>

            <Paper elevation={2} sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Monto total solicitado
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                Bs {totalFormatted}
              </Typography>
            </Paper>
          </Stack>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Ítems de la solicitud
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Ítem</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Cantidad</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Costo unitario (Bs)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="right">Total (Bs)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Respaldo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {request.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell align="right">{Number(item.quantity || 0).toLocaleString("es-BO")}</TableCell>
                    <TableCell align="right">
                      {Number(item.unit_cost || 0).toLocaleString("es-BO", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {Number(item.total_cost || 0).toLocaleString("es-BO", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      {item.support_url ? (
                        <Link href={item.support_url} target="_blank" rel="noopener noreferrer">
                          Ver respaldo
                        </Link>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Sin respaldo
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

