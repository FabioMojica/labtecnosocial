import { useState } from 'react';
import { 
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  TextField
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import EditViewObjectiveModal from './EditViewObjetiveModal';

const ObjectiveItem = ({ value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();

  const handleSave = (newText) => {
    onUpdate(newText);
  };

  const hasObjective = Boolean(value?.trim());

  return (
    <>
      <Box
      key="hola"
        sx={{
          padding: 0.5,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100%',
          textAlign: 'left',
          justifyContent: 'space-between',
          boxShadow: 3,
          gap: 0.5
        }}
      >
        {hasObjective ? (
          <Box sx={{
            height: 180,
            width: '100%',
            overflowY: 'auto',
            "&::-webkit-scrollbar": { width: "2px" },
            "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
          }}>
            <Typography
              sx={{
                display: "block",
                padding: 1,
                minHeight: '100%',
                width: "100%",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                wordBreak: 'break-word',
                borderRadius: 1,
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? 'rgba(200, 200, 200, 0.3)'
                    : 'rgba(100, 100, 100, 0.3)',
                color: theme.palette.text.primary,
              }}
              variant="caption"
            >
              {value}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'orange', fontWeight: 'bold', width: '100%', height: '100%' }}>
            <InfoOutlinedIcon fontSize="small" />
            <Typography
              variant="body2"
              sx={{
                fontStyle: 'italic',
                fontSize: '0.75rem',
                textAlign: 'center'
              }}>
              No se ha declarado un objetivo
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {!hasObjective ? (
            <Tooltip title="Crear objetivo">
              <IconButton size="small" onClick={() => setModalOpen(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Ver objetivo">
                <IconButton
                  size="small"
                  onClick={() => setModalOpen(true)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Borrar">
                <IconButton size="small" onClick={onDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      <EditViewObjectiveModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        value={value}
        onSave={handleSave}
      />
    </>
  );
};

export default ObjectiveItem;
