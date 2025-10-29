import { useState } from 'react';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditViewResourceModal from './EditViewResourceModal';

const ResourceItem = ({ value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (newResources) => {
    onUpdate(newResources);
  };

  const hasResources = value && value.length > 0;

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
        }}
      >
        {hasResources ? (
          <Box sx={{ width: '100%', overflowY: 'auto' }}>
            {value.map((res, index) => (
              <Box
                key={index}
                sx={{
                  padding: '4px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: 1,
                  marginBottom: 1,
                }}
              >
                <Typography
                  noWrap
                  sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  <strong>{`${index + 1}.`}</strong> {res}
                </Typography>
              </Box>
            ))}
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
            <Tooltip title="Agregar recursos">
              <IconButton size="small" onClick={() => setModalOpen(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Ver recursos">
                <IconButton size="small" onClick={() => setModalOpen(true)}>
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
        onClose={() => setModalOpen(false)}
        resources={value}
        onSave={handleSave}
      />
    </>
  );
};

export default ResourceItem;
