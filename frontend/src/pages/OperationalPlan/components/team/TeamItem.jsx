import { useState } from 'react';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditViewTeamModal from './EditViewTeamModal';

const TeamItem = ({ value, onUpdate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSave = (newValue) => {
    onUpdate(newValue);
  };

  const hasTeamMembers = value && value.length > 0;

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
        {hasTeamMembers ? (
          <Box sx={{ width: '100%', overflowY: 'auto'  }}>
            {value.map((member, index) => (
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
                  <strong>{`${index + 1}.`}</strong> {member}
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
              No se han declarado responsables
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          {!hasTeamMembers ? (
            <Tooltip title="Agregar responsables">
              <IconButton size="small" onClick={() => setModalOpen(true)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Ver responsables">
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

      <EditViewTeamModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        teamMembers={value}
        onSave={handleSave}
      />
    </>
  );
};

export default TeamItem;
