import { useState } from 'react';
import { Typography, Box, IconButton, Tooltip, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditViewResourceModal from './EditViewResourceModal';

const ResourceItem = ({ setGlobalModalOpen, value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);

   const openModal = () => {
    setModalOpen(true);
    setGlobalModalOpen(true);
  };
   const closeModal = () => {
    setModalOpen(false);
    setGlobalModalOpen(false);
  };

  const handleSave = (newResources) => {
    onUpdate(newResources);
  };

  const hasResources = value && value.length > 0;
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          padding: 1,
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'left',
          height: '100%',
          justifyContent: 'space-between',
          boxShadow: 3,
          gap: 1,
          p: 1,
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'light'
                ? 'rgba(0, 0, 0, 0.05)'
                : 'rgba(255, 255, 255, 0.08)',
            transition: 'background-color 0.2s ease',
          },
          borderRadius: 1,
          cursor: 'pointer',
          border: theme.palette.mode === "light"
            ? `1px solid #b9c0b3ff`
            : "1px solid #e0e0e0",
          transition: 'box-shadow 0.3s ease',
        }}
      >
        {hasResources ? (
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Lista de items:
            </Typography>
            <Box sx={{
              height: 123,
              overflowY: 'auto',
              "&::-webkit-scrollbar": { width: "2px" },
              "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
              "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
            }}>
              {value?.map((resource, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', mb: 0.8 }}>
                  <Box sx={{ width: '10%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginRight: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 0.8 }}>
                      {index + 1}.
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      display: 'block',
                      padding: 0.5,
                      width: '90%',
                      whiteSpace: 'nowrap',
                      overflowX: 'auto',
                      borderRadius: 1,
                      backgroundColor:
                        theme.palette.mode === 'light'
                          ? 'rgba(200, 200, 200, 0.3)'
                          : 'rgba(100, 100, 100, 0.3)',
                      color: theme.palette.text.primary,
                      "&::-webkit-scrollbar": { height: "2px" },
                      "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                      "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                      "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
                    }}
                    variant="caption"
                  >
                    {resource}
                  </Typography>
                </Box>
              ))}
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
              No se han declarado recursos
            </Typography>
          </Box> 
        )} 

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {!hasResources ? (
            <Tooltip title="Agregar recurso">
              <IconButton size="small" onClick={() => openModal()}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Ver recursos">
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

      <EditViewResourceModal
        open={modalOpen}
        onClose={() => closeModal()}
        resources={value}
        onSave={handleSave}
      />
    </>
  );
};

export default ResourceItem;
