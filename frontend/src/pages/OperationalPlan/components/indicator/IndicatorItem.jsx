import { useState } from 'react';
import {
  Typography,
  Box,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import EditViewIndicatorModal from './EditViewIndicatorModal'; 

const IndicatorItem = ({ setGlobalModalOpen, value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();

  const openModal = () => {
    setModalOpen(true);
    setGlobalModalOpen(true);
  };
   const closeModal = () => {
    setModalOpen(false);
    setGlobalModalOpen(false);
  };

  const handleSave = (newValue) => {
    onUpdate(newValue);
  };

  const hasIndicator = Boolean(value?.quantity?.trim() || value?.concept?.trim());

  return (
    <>
      <Box
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
        {hasIndicator ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1, height: 180 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Cantidad:
              </Typography>
              <Typography
                sx={{
                  display: "block",
                  padding: 0.5,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  wordBreak: 'break-word',
                  borderRadius: 1,
                  backgroundColor:
                    theme.palette.mode === 'light'
                      ? 'rgba(200, 200, 200, 0.3)'
                      : 'rgba(100, 100, 100, 0.3)',
                  color: theme.palette.text.primary,
                  WebkitLineClamp: 1,
                }}
                variant="caption"
              >
                {value.quantity}
              </Typography>
            </Box>

            <Box sx={{height: '100%', width: '100%'}}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Concepto:
              </Typography>
              
              <Typography
                sx={{
                  display: "block",
                  padding: 0.5,
                  height: 75,
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  wordBreak: 'break-word',
                  borderRadius: 1, 
                  overflowY: 'auto',
            "&::-webkit-scrollbar": { width: "2px" },
            "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                  backgroundColor:
                    theme.palette.mode === 'light'
                      ? 'rgba(200, 200, 200, 0.3)'
                      : 'rgba(100, 100, 100, 0.3)',
                  color: theme.palette.text.primary,
                  WebkitLineClamp: 1,
        
                }}
                variant="caption"
              >
                {value.concept}
              </Typography>
            </Box>
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
              No se ha declarado un indicador
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {!hasIndicator ? (
            <Tooltip title="Crear indicador">
              <IconButton size="small" onClick={() => openModal()}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Ver indicador">
                <IconButton size="small" onClick={() => openModal()}>
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

      <EditViewIndicatorModal
        open={modalOpen}
        onClose={() => closeModal()}
        value={value}
        onSave={handleSave}
      />
    </>
  );
};

export default IndicatorItem;
