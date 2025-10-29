import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditMisionItemModal from './EditMisionItemModal.jsx';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTheme } from '@emotion/react';

const MisionItem = ({ text, onEdit, onDelete, isSelected, onSelect }) => {
    const theme = useTheme();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleSaveEdit = (newText) => {
        onEdit(newText);
        setIsEditModalOpen(false);
    };

    return (
        <>
            <Box
                onClick={onSelect}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 1,
                    '&:hover': {
                        backgroundColor:
                            theme.palette.mode === 'light'
                                ? 'rgba(0, 0, 0, 0.05)'
                                : 'rgba(255, 255, 255, 0.08)',
                        transition: 'background-color 0.2s ease',
                    },

                    borderRadius: 1,
                    marginBottom: 1,
                    cursor: 'pointer',
                    border: '1px solid #e0e0e0',
                    boxShadow: text
                        ? '0 6px 15px rgba(25, 118, 210, 0.5)'
                        : '0px 2px 5px rgba(0, 0, 0, 0.1)',
                    transition: 'box-shadow 0.3s ease',
                    maxHeight: '300px',
                }}
            >
                <Typography
                    sx={{
                        display: "block",
                        padding: 1,
                        marginBottom: 2,
                        maxWidth: "100%",
                        maxHeight: 300,
                        overflowY: 'auto',
                        "&::-webkit-scrollbar": { width: "2px" },
                        "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
                        "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
                        "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
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
                    {text}
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Tooltip title="Ver o editar misión">
                        <IconButton
                            size="small"
                            onClick={(e) => { handleOpenEditModal(); }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                </Box>
            </Box>

            <EditMisionItemModal
                open={isEditModalOpen}
                onClose={handleCloseEditModal}
                initialText={text}
                onSave={handleSaveEdit}
            />
        </>
    );
};

export default MisionItem;
