import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import { useTheme } from "@emotion/react";
import { useNotification } from "../../../../contexts/ToastContext.jsx";
import { createOperationalProjectApi } from "../../../../api/operationalProjects.js";
import { createProjectFormData } from "../../../CreateProjectPage/utils/createProjectFormData.js";
import {
  cleanExtraSpaces,
  validateRequiredText,
  validateTextLength,
} from "../../../../utils/textUtils.js";

const initialErrors = { name: "", description: "" };

const validateName = (value) =>
  validateRequiredText(value, "Nombre del proyecto") ||
  validateTextLength(value, 3, 100, "Nombre del proyecto") ||
  "";

const validateDescription = (value) =>
  validateRequiredText(value, "Descripción") ||
  validateTextLength(value, 5, 300, "Descripción") ||
  "";

const QuickCreateOperationalProjectModal = ({ open, onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState(initialErrors);
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const { notify } = useNotification();

  const isFormValid = useMemo(() => {
    const normalizedName = cleanExtraSpaces(name);
    const normalizedDescription = cleanExtraSpaces(description);
    return (
      !validateName(normalizedName) &&
      !validateDescription(normalizedDescription)
    );
  }, [name, description]);

  const handleClose = (force = false) => {
    if (saving && !force) return;
    setName("");
    setDescription("");
    setErrors(initialErrors);
    onClose?.();
  };

  const handleNameChange = (event) => {
    const raw = event.target.value;
    setName(raw);
    setErrors((prev) => ({ ...prev, name: validateName(raw) }));
  };

  const handleDescriptionChange = (event) => {
    const raw = event.target.value;
    setDescription(raw);
    setErrors((prev) => ({ ...prev, description: validateDescription(raw) }));
  };

  const handleNameBlur = () => {
    const cleaned = cleanExtraSpaces(name);
    setName(cleaned);
    setErrors((prev) => ({ ...prev, name: validateName(cleaned) }));
  };

  const handleDescriptionBlur = () => {
    const cleaned = cleanExtraSpaces(description);
    setDescription(cleaned);
    setErrors((prev) => ({ ...prev, description: validateDescription(cleaned) }));
  };

  const handleCreate = async () => {
    const normalizedName = cleanExtraSpaces(name);
    const normalizedDescription = cleanExtraSpaces(description);
    const nextErrors = {
      name: validateName(normalizedName),
      description: validateDescription(normalizedDescription),
    };
    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.description) return;

    try {
      setSaving(true);
      const formData = createProjectFormData({
        name: normalizedName,
        description: normalizedDescription,
        image_file: null,
        responsibles: [],
        integrations: [],
      });
      const createdProject = await createOperationalProjectApi(formData);
      notify("Proyecto operativo creado correctamente.", "success");
      onCreated?.(createdProject);
      handleClose(true);
    } catch {
      notify(
        "Ocurrió un error inesperado al crear el proyecto operativo. Inténtalo nuevamente más tarde.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Creación rápida de proyecto operativo</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DriveFileRenameOutlineIcon />
              <Typography sx={{ fontWeight: "bold" }} variant="h6">
                Nombre del proyecto
              </Typography>
            </Box>
            <TextField
              label={
                <>
                  Ingrese un nombre para el proyecto{" "}
                  <span style={{ color: theme.palette.error.main }}>*</span>
                </>
              }
              fullWidth
              size="small"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              error={!!errors.name}
              inputProps={{ maxLength: 100 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5, px: 0.5 }}>
              <Typography variant="caption" color="error" sx={{ visibility: errors.name ? "visible" : "hidden" }}>
                {errors.name || "placeholder"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {name.length} / 100
              </Typography>
            </Box>
          </Box>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <DescriptionIcon />
              <Typography sx={{ fontWeight: "bold" }} variant="h6">
                Descripción
              </Typography>
            </Box>
            <TextField
              label={
                <>
                  Ingrese una descripción para el proyecto{" "}
                  <span style={{ color: theme.palette.error.main }}>*</span>
                </>
              }
              fullWidth
              multiline
              minRows={4}
              maxRows={8}
              value={description}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
              error={!!errors.description}
              inputProps={{ maxLength: 300 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5, px: 0.5 }}>
              <Typography
                variant="caption"
                color="error"
                sx={{ visibility: errors.description ? "visible" : "hidden" }}
              >
                {errors.description || "placeholder"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {description.length} / 300
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleCreate} disabled={!isFormValid || saving} variant="contained">
          {saving ? <CircularProgress size={18} color="inherit" /> : "Crear proyecto"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickCreateOperationalProjectModal;
