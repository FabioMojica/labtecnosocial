import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";
import { useFetchAndLoad } from "../../../hooks";
import { useNotification } from "../../../contexts";
import { createProjectBudgetRequestApi } from "../../../api";
import { createBudgetRequestFormData } from "../utils/createBudgetRequestFormData";

const createEmptyItem = () => ({
  id: crypto.randomUUID(),
  item_name: "",
  quantity: "",
  unit_cost: "",
  support_file: null,
});

const normalizeCurrencyValue = (value) => value.replace(",", ".");

export const CreateBudgetRequestDialog = ({ open, onClose, projectId, projectBudgetAmount, onCreated }) => {
  const fileInputsRef = useRef({});
  const { notify } = useNotification();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [objective, setObjective] = useState("");
  const [items, setItems] = useState([createEmptyItem()]);

  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      const quantity = Number(normalizeCurrencyValue(String(item.quantity || 0)));
      const unitCost = Number(normalizeCurrencyValue(String(item.unit_cost || 0)));
      if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) return acc;
      return Number((acc + quantity * unitCost).toFixed(2));
    }, 0);
  }, [items]);

  const resetState = () => {
    setObjective("");
    setItems([createEmptyItem()]);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose?.();
  };

  const handleItemChange = (itemId, patch) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (itemId) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((item) => item.id !== itemId);
    });
  };

  const validateForm = () => {
    if (!objective.trim()) {
      notify("Debes ingresar el objetivo de la solicitud.", "warning");
      return false;
    }

    if (objective.trim().length > 100) {
      notify("El objetivo de la solicitud no puede exceder 100 caracteres.", "warning");
      return false;
    }

    if (!Number.isFinite(projectBudgetAmount)) {
      notify("Este proyecto no tiene un presupuesto definido para recibir solicitudes.", "warning");
      return false;
    }

    for (const [index, item] of items.entries()) {
      if (!String(item.item_name || "").trim()) {
        notify(`El ítem ${index + 1} debe tener un nombre.`, "warning");
        return false;
      }

      const quantity = Number(normalizeCurrencyValue(String(item.quantity || "")));
      if (!Number.isFinite(quantity) || quantity <= 0) {
        notify(`La cantidad del ítem ${index + 1} debe ser mayor a 0.`, "warning");
        return false;
      }

      const unitCost = Number(normalizeCurrencyValue(String(item.unit_cost || "")));
      if (!Number.isFinite(unitCost) || unitCost < 0) {
        notify(`El costo unitario del Ã­tem ${index + 1} debe ser válido.`, "warning");
        return false;
      }
    }

    if (totalAmount <= 0) {
      notify("La solicitud debe tener un monto total mayor a 0.", "warning");
      return false;
    }

    if (totalAmount > projectBudgetAmount) {
      notify("El monto pedido supera el presupuesto disponible del proyecto.", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = createBudgetRequestFormData({
        objective: objective.trim(),
        items: items.map((item) => ({
          item_name: item.item_name.trim(),
          quantity: normalizeCurrencyValue(String(item.quantity)),
          unit_cost: normalizeCurrencyValue(String(item.unit_cost)),
          support_file: item.support_file || null,
        })),
      });

      const createdRequest = await callEndpoint(createProjectBudgetRequestApi(projectId, payload));
      notify("Solicitud enviada correctamente.", "success");
      onCreated?.(createdRequest);
      handleClose();
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const budgetFormatted = Number(projectBudgetAmount || 0).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ fontWeight: "bold" }}>Nueva solicitud</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Fecha
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {new Date().toLocaleString("es-BO")}
            </Typography>
          </Box>

          <TextField
            label="Objetivo"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            inputProps={{ maxLength: 100 }}
            helperText={`${objective.length}/100`}
            fullWidth
          />

          <Paper elevation={2} sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Ítems de la solicitud
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem}>
                Agregar ítem
              </Button>
            </Stack>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Ítem</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Cantidad</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Costo unitario (Bs)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Total (Bs)</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Respaldo</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => {
                  const quantity = Number(normalizeCurrencyValue(String(item.quantity || 0)));
                  const unitCost = Number(normalizeCurrencyValue(String(item.unit_cost || 0)));
                  const rowTotal = Number.isFinite(quantity) && Number.isFinite(unitCost)
                    ? Number((quantity * unitCost).toFixed(2))
                    : 0;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.item_name}
                          onChange={(event) => handleItemChange(item.id, { item_name: event.target.value })}
                          inputProps={{ maxLength: 120 }}
                          placeholder="Ej. Lápices"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.quantity}
                          onChange={(event) => handleItemChange(item.id, { quantity: event.target.value })}
                          placeholder="0"
                          fullWidth
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={item.unit_cost}
                          onChange={(event) => handleItemChange(item.id, { unit_cost: event.target.value })}
                          placeholder="0.00"
                          fullWidth
                          InputProps={{
                            startAdornment: <InputAdornment position="start">Bs</InputAdornment>,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {rowTotal.toLocaleString("es-BO", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <input
                          ref={(node) => {
                            fileInputsRef.current[item.id] = node;
                          }}
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(event) => {
                            const file = event.target.files?.[0] || null;
                            handleItemChange(item.id, { support_file: file });
                            event.target.value = "";
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<UploadFileIcon />}
                          onClick={() => fileInputsRef.current[item.id]?.click()}
                        >
                          {item.support_file ? "Cambiar" : "Subir"}
                        </Button>
                        <Typography variant="caption" display="block" mt={0.5} noWrap maxWidth={120}>
                          {item.support_file?.name || "Sin archivo"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Eliminar ítem">
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => removeItem(item.id)}
                              disabled={items.length === 1}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          <Divider />

          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Paper elevation={2} sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Presupuesto del proyecto
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                Bs {budgetFormatted}
              </Typography>
            </Paper>

            <Paper elevation={2} sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                Costo total solicitado
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                Bs {totalAmount.toLocaleString("es-BO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          Enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

