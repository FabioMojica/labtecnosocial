import {
    Box,
    Typography,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../../contexts';
import { SelectYear } from './SelectYear';

export default function PageHeader({
    selectedYear,
    setSelectedYear,
    view,
    setView,
    handleOpenDeletePlanModal,
    hasPlan, 
}) {
    const { user } = useAuth();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 2,
                width: '100%',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    width: '100%',
                    mb: { xs: 2, sm: 0 },
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontSize: { xs: '1.1rem', sm: '2rem' },
                        textAlign: { xs: 'left', sm: 'left' },
                        wordBreak: 'break-word',
                        flexGrow: 1,
                    }}
                >
                    Planificación estratégica
                </Typography>


                {/* Selector de año siempre visible */}
                <SelectYear
                    selectedYear={selectedYear}
                    onChange={(year) => setSelectedYear(year)}
                />

                {/* Icono de eliminar (solo si hay plan y rol admin) */}
                {hasPlan && user?.role === 'admin' && (
                    <Tooltip title="Eliminar plan estratégico" arrow>
                        <IconButton
                            size="small"
                            onClick={handleOpenDeletePlanModal}
                            sx={{
                                display: { xs: 'flex', sm: 'none' },
                                ml: 1,
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* Sección derecha: vista y botón eliminar (solo si hay plan) */}
            {hasPlan && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 2,
                        width: { xs: '100%', sm: 'auto' },
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    }}
                >
                    {user?.role === 'admin' && (
                        <Select
                            value={view}
                            onChange={(e) => setView(e.target.value)}
                            size="small"
                            sx={{ width: { xs: '100%', sm: '180' } }}
                        >
                            <MenuItem value="editable">Vista editable</MenuItem>
                            <MenuItem value="document">Vista documento</MenuItem>
                        </Select>
                    )}

                    {hasPlan && user?.role === 'admin' && view !== 'document' && (
                        <IconButton
                            size="small"
                            onClick={handleOpenDeletePlanModal}
                            sx={{
                                display: { xs: 'none', sm: 'flex' },
                                alignSelf: 'center',
                            }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    )}
                </Box>
            )}
        </Box>
    );
}
