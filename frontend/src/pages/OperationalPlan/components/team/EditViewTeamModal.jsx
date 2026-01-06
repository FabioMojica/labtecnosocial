import React, { useState } from 'react';
import { Modal, Box, TextField, Button, IconButton, Typography, useTheme, Tooltip, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import useKeyboardShortcuts from '../../../../hooks/useKeyboardShortcuts';

const EditViewTeamModal = ({ open, onClose, teamMembers, onSave, maxLength= 100 }) => {
  const [newMember, setNewMember] = useState('');
  const [members, setMembers] = useState(teamMembers || []);
  const theme = useTheme();

  const handleAddMember = () => {
    if (newMember.trim()) {
      setMembers([...members, newMember]);
      setNewMember('');
    }
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(members);
    onClose();
  };

  useKeyboardShortcuts({
    enabled: open,
    onEnter: () => {
      if (newMember.trim()) {
        handleAddMember();
      } else {
        handleSave();
      }
    },
    onEscape: onClose,
  });

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));


  return (
    <Modal
      open={open}
      onClose={(event, reason) => {
        if (reason === "backdropClick") return;
        onClose();
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: {
            xs: 300,
            md: 500,
          },
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          pt: 2,
        }}
      >
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Responsables
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'center',
            gap: 1,
            mb: 1
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
          <TextField
            label="Nuevo Responsable"
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            variant="outlined"
            sx={{ flex: 1 }}
            inputProps={{ maxLength: maxLength }}
          />
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ mt: 0.5, display: "block", textAlign: "right", mb: 2 }}
          >
            Caracteres: {newMember.length} / {maxLength}
          </Typography>
          </Box>

          <Tooltip title={isSmallScreen ? 'Agregar (enter)' : 'Agregar responsable'} arrow>
            <IconButton
              onClick={handleAddMember}
              color="primary"
              size="large"
              sx={{ height: '32px', width: '32px', mt: 1.5 }} 
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Responsables:
        </Typography>

        {members.length > 0 ? (
          <Box
            sx={{
              mb: 2,
              maxHeight: '200px',
              overflowY: 'auto',
              "&::-webkit-scrollbar": { width: "2px" },
              "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
              "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
              "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
              border: '1px solid #ccc',
              borderRadius: 1,
              p: 1,
            }}
          >
            {members.map((member, index) => (

              <Box key={index} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, width: '100%', mb: 1
              }}>
                <Typography variant="body2" sx={{ fontWeight: 600, marginBottom: 0.8 }}>
                  {index + 1}.
                </Typography>

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

                <IconButton size="small" onClick={() => handleRemoveMember(index)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No se han declarado responsables.
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleSave} variant="contained">
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditViewTeamModal;
