import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
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
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
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

const sanitizeDecimalInput = (value) => {
  const normalized = value.replace(",", ".");
  const onlyNumbersAndDecimal = normalized.replace(/[^\d.]/g, "");
  const [integerPart, ...decimalParts] = onlyNumbersAndDecimal.split(".");

  return decimalParts.length > 0
    ? `${integerPart}.${decimalParts.join("")}`
    : integerPart;
};

export const CreateBudgetRequestDialog = ({ open, onClose, projectId, projectBudgetAmount, onCreated }) => {
  const fileInputsRef = useRef({});
  const { notify } = useNotification();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [objective, setObjective] = useState("");
  const [items, setItems] = useState([createEmptyItem()]);
  const [previewImage, setPreviewImage] = useState(null);

  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      const quantity = Number(normalizeCurrencyValue(String(item.quantity || 0)));
      const unitCost = Number(normalizeCurrencyValue(String(item.unit_cost || 0)));
      if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) return acc;
      return Number((acc + quantity * unitCost).toFixed(2));
    }, 0);
  }, [items]);

  const hasIncompleteRequiredItems = useMemo(() => {
    return items.some((item) => {
      return (
        !String(item.item_name || "").trim() ||
        !String(item.quantity || "").trim() ||
        !String(item.unit_cost || "").trim()
      );
    });
  }, [items]);

  const exceedsProjectBudget = !Number.isFinite(projectBudgetAmount) || totalAmount > projectBudgetAmount;
  const isSubmitDisabled = loading || !objective.trim() || hasIncompleteRequiredItems || exceedsProjectBudget;

  const resetState = () => {
    setObjective("");
    setItems([createEmptyItem()]);
    setPreviewImage(null);
  };

  useEffect(() => {
    return () => {
      if (previewImage?.url) {
        URL.revokeObjectURL(previewImage.url);
      }
    };
  }, [previewImage]);

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose?.();
  };

  const handleItemChange = (itemId, patch) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  };

  const handlePreviewImage = (file) => {
    if (!file) return;
    setPreviewImage({
      file,
      url: URL.createObjectURL(file),
    });
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleRemoveSupportFile = (itemId) => {
    const removedItem = items.find((item) => item.id === itemId);
    if (removedItem?.support_file === previewImage?.file) {
      setPreviewImage(null);
    }

    const input = fileInputsRef.current[itemId];
    if (input) {
      input.value = "";
    }

    handleItemChange(itemId, { support_file: null });
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
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            height: "calc(100vh - 48px)",
            maxHeight: "calc(100vh - 48px)",
            display: "flex",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Nueva solicitud</DialogTitle>
        <DialogContent sx={{ pt: 1, display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden" }}>
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <TextField
            label="Objetivo"
            value={objective}
            onChange={(event) => setObjective(event.target.value)}
            inputProps={{ maxLength: 100 }}
            helperText={`${objective.length}/100`}
            fullWidth
          />

          <Paper elevation={2} sx={{ p: 2, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Ítems de la solicitud
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={addItem}>
                Agregar ítem
              </Button>
            </Stack>

            <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
              <Table size="small" stickyHeader>
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
                            onChange={(event) => handleItemChange(item.id, { quantity: sanitizeDecimalInput(event.target.value) })}
                            placeholder="0"
                            inputProps={{ inputMode: "decimal" }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={item.unit_cost}
                            onChange={(event) => handleItemChange(item.id, { unit_cost: sanitizeDecimalInput(event.target.value) })}
                            placeholder="0.00"
                            inputProps={{ inputMode: "decimal" }}
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
                          {item.support_file ? (
                            <Stack spacing={0.5} alignItems="flex-start">
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<VisibilityOutlinedIcon />}
                                  onClick={() => handlePreviewImage(item.support_file)}
                                >
                                  Ver
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<UploadFileIcon />}
                                  onClick={() => fileInputsRef.current[item.id]?.click()}
                                >
                                  Cambiar
                                </Button>
                                <Tooltip title="Eliminar respaldo">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveSupportFile(item.id)}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                              <Typography variant="caption" display="block" noWrap maxWidth={180}>
                                {item.support_file.name}
                              </Typography>
                            </Stack>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<UploadFileIcon />}
                              onClick={() => fileInputsRef.current[item.id]?.click()}
                            >
                              Subir imagen
                            </Button>
                          )}
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
            </TableContainer>
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
          <Button variant="contained" onClick={handleSubmit} disabled={isSubmitDisabled}>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(previewImage)} onClose={handleClosePreview} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>Vista previa</DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box
              component="img"
              src={previewImage.url}
              alt={previewImage.file.name}
              sx={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                bgcolor: "background.default",
              }}
            />
          )}
          <Typography variant="body2" color="text.secondary" mt={1} noWrap>
            {previewImage?.file.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

