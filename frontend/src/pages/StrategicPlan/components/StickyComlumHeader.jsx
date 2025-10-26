
import { Box, Typography, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const StickyColumnHeader = ({
    title,
    showAddButton = false,
    onAddClick,
    description = '',
}) => {
    return (
        <Box
            sx={{
                width: '25%',
                padding: 2,
                backgroundColor: 'white',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                boxShadow: 3,
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 40 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
                {showAddButton && (
                    <IconButton onClick={onAddClick}>
                        <AddIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>
            <Divider />
            <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                    padding: '4px',
                    display: '-webkit-box',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.5,
                    height: 45,
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    WebkitLineClamp: 2,
                }}
            >
                {description}
            </Typography>
            <Divider sx={{ marginBottom: 1 }} />
        </Box>
    );
};

export default StickyColumnHeader;
