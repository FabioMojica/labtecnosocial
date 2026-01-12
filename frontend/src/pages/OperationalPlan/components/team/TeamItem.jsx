import { useState } from 'react';
import { Typography, Box, IconButton, Tooltip, useTheme } from '@mui/material';
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
        }}
      >
        {hasTeamMembers ? (
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Conformado por:
            </Typography>
            <Box sx={{
              height: 123,
              overflowY: 'auto',
              "&::-webkit-scrollbar": { width: "2px" },
              "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
              "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
            }}>
              {value.map((member, index) => (
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
                    {member}
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
