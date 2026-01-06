import { useState, useEffect } from 'react';
import { Box, Divider, Button, Typography, IconButton, Grid, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useConfirm } from 'material-ui-confirm';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import ObjectiveItem from './components/objective/ObjetiveItem';
import IndicatorItem from './components/indicator/IndicatorItem';
import TeamItem from './components/team/TeamItem';
import ResourceItem from './components/resource/ResourceItem';
import BudgetItem from './components/budget/BudgetItem';
import PeriodItem from './components/period/PeriodItem';

import isEqual from "lodash.isequal";
import cloneDeep from "lodash/cloneDeep";


import { getOperationalPlanOfProjectApi, saveOperationalRowsApi } from '../../api';

import { isRowEmpty, toNullableNumber } from './utils/rowsFuncions';
import { useNotification } from '../../contexts';
import { ButtonWithLoader, FullScreenProgress, NoResultsScreen } from '../../generalComponents';
import { useFetchAndLoad } from '../../hooks';


const OperationalPlanningTable = ({ projectId, onProjectWithoutPlan, onProjectHasPlan, onEditingChange, hasPlan }) => {
    const confirm = useConfirm();
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const [rows, setRows] = useState([]);
    const [hoveredRow, setHoveredRow] = useState(null);
    const theme = useTheme();
    const [contextMenu, setContextMenu] = useState(null);

    const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initialRows, setInitialRows] = useState([]);
    const [hasLoadError, setHasLoadError] = useState(false);

    useEffect(() => {
    if (!projectId || !hasPlan) {
        setRows([]);
        setInitialRows([]);
    }
}, [projectId, hasPlan]);


    useEffect(() => {
        if (!projectId) {
            setRows([]);
            setInitialRows([]);
            return;
        }

        const fetchProjectDetails = async () => {
            setLoadingProjectDetails(true);
            try {
                const res = await getOperationalPlanOfProjectApi(projectId);

                if (Array.isArray(res) && res.length === 0) {
                    if (onProjectWithoutPlan) onProjectWithoutPlan(projectId);
                }

                const transformedRows = res.map(row => ({
                    id: row.id,
                    objective: row.objective || '',
                    indicator: {
                        quantity: row.indicator_amount || '',
                        concept: row.indicator_concept || ''
                    },
                    team: row.team || [],
                    resource: row.resources || [],
                    budget: {
                        amount: row.budget_amount || '',
                        description: row.budget_description || ''
                    },
                    period: {
                        start: row.period_start || '',
                        end: row.period_end || ''
                    },
                }));

                setRows(transformedRows);
                setInitialRows(cloneDeep(transformedRows));
                setHasLoadError(false);
            } catch (error) {
                notify("Ocurrió un error inesperado al obtener el plan operativo. Inténtalo de nuevo más tarde.", 'error');
                setHasLoadError(true);
            } finally {
                setLoadingProjectDetails(false);
            }
        };
        fetchProjectDetails();
    }, [projectId]);

    // Objetivos oooooooooooooooooooooooooooooooooooooooooooooooooo
    const handleUpdateObjetiveItem = (index, key, newText) => {
        setRows(prev =>
            prev.map((row, i) =>
                i === index ? { ...row, [key]: newText } : row
            )
        );
    };

    const handleDeleteObjetiveItem = (index, key) => {
        confirm({
            title: "Borrar objetivo",
            description: "¿Está seguro que desea borrar el contenido de este objetivo?",
            confirmationText: "Sí, borrar",
            cancellationText: "No",
        })
            .then((result) => {
                if (result.confirmed === true) {
                    setRows(prev =>
                        prev.map((row, i) =>
                            i === index ? { ...row, [key]: '' } : row
                        )
                    );
                }
            })
            .catch(() => {
            });
    };
    // ooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo
    // Indicadores iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
    const handleUpdateIndicatorItem = (index, key, newText) => {
        setRows(prev =>
            prev.map((row, i) =>
                i === index ? { ...row, [key]: newText } : row
            )
        );
    };

    const handleDeleteIndicatorItem = (index, key) => {
        confirm({
            title: "Borrar indicador",
            description: "¿Está seguro que desea borrar el contenido de este indicador?",
            confirmationText: "Sí, borrar",
            cancellationText: "No",
        })
            .then((result) => {
                if (result.confirmed === true) {
                    setRows(prev =>
                        prev.map((row, i) =>
                            i === index ? { ...row, [key]: '' } : row
                        )
                    );
                }
            })
            .catch(() => {
            });
    };
    // iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii
    // Equipo eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
    const handleUpdateTeamItem = (index, newTeamMembers) => {
        setRows(prev =>
            prev.map((row, i) =>
                i === index ? { ...row, team: newTeamMembers } : row
            )
        );
    };
    const handleDeleteTeamItem = (index, key) => {
        confirm({
            title: "Borrar equipo",
            description: "¿Está seguro que desea borrar el contenido de este equipo?",
            confirmationText: "Sí, borrar",
            cancellationText: "No",
        })
            .then((result) => {
                if (result.confirmed === true) {
                    setRows(prev =>
                        prev.map((row, i) =>
                            i === index ? { ...row, [key]: [] } : row
                        )
                    );
                }
            })
            .catch(() => { });
    };
    // eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
    // Recursos rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
    const handleUpdateResourceItem = (index, newResource) => {
        setRows(prev =>
            prev.map((row, i) =>
                i === index ? { ...row, resource: newResource } : row
            )
        );
    };
    const handleDeleteResourceItem = (index, key) => {
        confirm({
            title: "Borrar recursos",
            description: "¿Está seguro que desea borrar el contenido de este recurso?",
            confirmationText: "Sí, borrar",
            cancellationText: "No",
        })
            .then((result) => {
                if (result.confirmed === true) {
                    setRows(prev =>
                        prev.map((row, i) =>
                            i === index ? { ...row, [key]: [] } : row
                        )
                    );
                }
            })
            .catch(() => { });
    };
    // rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr
    // Presupuesto ppppppppppppppppppppppppppppppppppppppppppppppppppppppp
    const handleUpdateBudgetItem = (index, newBudget) => {
        setRows(prev =>
            prev.map((row, i) =>
                i === index ? { ...row, budget: newBudget } : row
            )
        );
    };

    const handleDeleteBudgetItem = (index, key) => {
        confirm({
            title: "Borrar presupuesto",
            description: "¿Está seguro que desea borrar el contenido de este presupuesto?",
            confirmationText: "Sí, borrar",
            cancellationText: "No",
        })
            .then((result) => {
                if (result.confirmed === true) {
                    setRows(prev =>
                        prev.map((row, i) =>
                            i === index ? { ...row, [key]: '' } : row
                        )
                    );
                }
            })
            .catch(() => { });
    };
    // ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp
    // Periodo ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp
    const handleUpdatePeriodItem = (index, newPeriod) => {
        setRows(prev =>
            prev.map((row, i) =>
                i === index ? { ...row, period: newPeriod } : row
            )
        );
    };

    const handleDeletePeriodItem = (index, key) => {
        confirm({
            title: "Borrar periodo",
            description: "¿Está seguro que desea borrar el contenido de este periodo?",
            confirmationText: "Sí, borrar",
            cancellationText: "No",
        })
            .then((result) => {
                if (result.confirmed === true) {
                    setRows(prev =>
                        prev.map((row, i) =>
                            i === index ? { ...row, [key]: '' } : row
                        )
                    );
                }
            })
            .catch(() => { });
    };
    // ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp


    const handleAddRow = () => {
        if (!projectId) return;
        setRows(prev => [
            ...prev,
            {
                objective: '',
                indicator: { quantity: '', concept: '' },
                team: [],
                resource: [],
                budget: { amount: '', description: '' },
                period: { start: '', end: '' },
            },
        ]);
    };

    const handleDeleteRow = () => {
        if (rows.length === 1) {
            notify("No puedes dejar un plan operativo sin filas operativas.", "info");
            setContextMenu(null);
            return;
        }

        confirm({
            title: "Eliminar fila",
            description: "¿Estás seguro que deseas borrar esta fila? Si la elimina y NO presiona guardar tabla podrá recuperar la fila descartando los cambios (si la fila no está vacia). Pero si presiona guardar tabla borrará la fila permanentemente",
            confirmationText: "Sí, borrar",
            cancellationText: "Cancelar",
        })
            .then((result) => {
                if (result.confirmed === true) {
                    setRows(prev => prev.filter((_, i) => i !== contextMenu.rowIndex));
                    setContextMenu(null);
                } else {
                    setContextMenu(null);
                }
            })
            .catch(() => { setContextMenu(null); });
    };

    const handleContextMenu = (event, index) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4, rowIndex: index }
                : null,
        );
    };

    const handleMouseEnter = (index) => {
        setHoveredRow(index);
    };

    const handleMouseLeave = () => {
        setHoveredRow(null);
    };

    const columns = [
        {
            title: 'Objetivo',
            key: 'objective',
            component: (props) => (
                <ObjectiveItem
                    {...props}
                    onUpdate={(newText) =>
                        handleUpdateObjetiveItem(props.index, 'objective', newText)
                    }
                    onDelete={() =>
                        handleDeleteObjetiveItem(props.index, 'objective')
                    }
                />
            ),
        },
        {
            title: 'Indicador',
            key: 'indicator',
            component: (props) => (
                <IndicatorItem
                    {...props}
                    onUpdate={(newText) =>
                        handleUpdateIndicatorItem(props.index, 'indicator', newText)
                    }
                    onDelete={() =>
                        handleDeleteIndicatorItem(props.index, 'indicator')
                    }
                />
            ),
        },
        {
            title: 'Equipo',
            key: 'team',
            component: (props) => (
                <TeamItem
                    {...props}
                    onUpdate={(newTeamMembers) =>
                        handleUpdateTeamItem(props.index, newTeamMembers)
                    }
                    onDelete={() =>
                        handleDeleteTeamItem(props.index, 'team')
                    }
                />
            ),
        },
        {
            title: 'Recursos',
            key: 'resource',
            component: (props) => (
                <ResourceItem
                    {...props}
                    onUpdate={(newResource) =>
                        handleUpdateResourceItem(props.index, newResource)
                    }
                    onDelete={() =>
                        handleDeleteResourceItem(props.index, 'resource')
                    }
                />
            ),
        },
        {
            title: 'Presupuesto',
            key: 'budget',
            component: (props) => (
                <BudgetItem
                    {...props}
                    onUpdate={(newBudget) =>
                        handleUpdateBudgetItem(props.index, newBudget)
                    }
                    onDelete={() =>
                        handleDeleteBudgetItem(props.index, 'budget')
                    }
                />
            ),
        },
        {
            title: 'Periodo',
            key: 'period',
            component: (props) => (
                <PeriodItem
                    {...props}
                    onUpdate={(newPeriod) =>
                        handleUpdatePeriodItem(props.index, newPeriod)
                    }
                    onDelete={() =>
                        handleDeletePeriodItem(props.index, 'period')
                    }
                />
            ),
        },
    ];

    const hasChanges = () => !isEqual(rows, initialRows);

    useEffect(() => {
        if (onEditingChange) {
            onEditingChange(hasChanges());
        }
    }, [rows, initialRows]);

    const handleDiscardChanges = () => {
        confirm({
            title: "Descartar cambios",
            description: "¿Deseas descartar todos los cambios no guardados?",
            confirmationText: "Sí, descartar",
            cancellationText: "Cancelar",
        })
            .then((result) => {
                if (result.confirmed === true) {
                    setRows(initialRows);
                    notify("Cambios descartados correctamente.", "info");
                }
            })
            .catch(() => { });
    };



    const handleSave = async () => {
        if (rows.some(row => isRowEmpty(row))) {
            notify('No se puede guardar un plan si hay filas vacías.', 'info');
            return;
        }

        const formatRow = (row) => ({
            id: row.id || null,
            objective: row.objective || null,
            indicator_amount: toNullableNumber(row.indicator.quantity),
            indicator_concept: row.indicator.concept ? row.indicator.concept.trim() : null,
            team: Array.isArray(row.team) ? row.team : [],
            resources: Array.isArray(row.resource) ? row.resource : [],
            budget_amount: toNullableNumber(row.budget.amount),
            budget_description: row.budget.description || null,
            period_start: row.period.start || null,
            period_end: row.period.end || null,
        });

        const formattedRows = rows.map(formatRow);

        const hasPlanYet = initialRows.length > 0;
        
        if (!hasPlanYet && formattedRows.length > 0) {
            if (onProjectHasPlan) onProjectHasPlan(projectId);
        }

        const formattedInitialRows = initialRows.map(formatRow);

        const initialMap = new Map(formattedInitialRows.map(row => [row.id, row]));
        const currentMap = new Map(formattedRows.map(row => [row.id, row]));

        const rowsToCreate = formattedRows.filter(row => !row.id);
        const rowsToUpdate = formattedRows.filter(row => {
            if (!row.id) return false;
            const initial = initialMap.get(row.id);
            return JSON.stringify(initial) !== JSON.stringify(row);
        });
        const rowsToDelete = formattedInitialRows.filter(row => !currentMap.has(row.id));

        setSaving(true);
        try {
            const response = await callEndpoint(saveOperationalRowsApi(projectId, {
                create: rowsToCreate,
                update: rowsToUpdate,
                delete: rowsToDelete.map(r => r.id),
            }));

            const updatedRows = response.map(row => ({
                id: row.id,
                objective: row.objective,
                indicator: {
                    quantity: row.indicator_amount,
                    concept: row.indicator_concept,
                },
                team: row.team,
                resource: row.resources,
                budget: {
                    amount: row.budget_amount,
                    description: row.budget_description,
                },
                period: {
                    start: row.period_start,
                    end: row.period_end,
                },
            }));

            setInitialRows(cloneDeep(updatedRows));
            setRows(updatedRows);


            notify('Plan operativo guardado correctamente.', 'success');
        } catch (error) {
            notify("Ocurrió un error inesperado al guardar el plan operativo. Inténtalo de nuevo más tarde.", 'error');
        } finally {
            setSaving(false);
        }
    };


    if (loadingProjectDetails) {
        return (
            <FullScreenProgress text={"Obteniendo el plan operativo"} />
        );
    }

    if (hasLoadError) {
        return null;
    }

    return (
        <>
            <Box sx={{ p: 1, borderTop: '1px solid #ccc' }}>
                <Box sx={{ display: 'flex', flex: 'row', justifyContent: 'flex-end', gap: 2, marginBottom: 2 }}>

                    {hasChanges() && (
                        <Button
                            variant="outlined"
                            color="error"
                            sx={{ width: '170px' }}
                            onClick={handleDiscardChanges}
                        >
                            Descartar cambios
                        </Button>
                    )}

                    {rows.length > 0 && projectId && (
                        <ButtonWithLoader
                            loading={loading}
                            disabled={!hasChanges() || rows.some(row => isRowEmpty(row))}
                            onClick={handleSave}
                            variant="contained"
                            sx={{ color: 'white', px: 2, width: '150px' }}
                        >
                            Guardar Plan
                        </ButtonWithLoader>
                    )}


                </Box>
                {rows.length === 0 && !loadingProjectDetails && projectId ? (
                    <NoResultsScreen
                        message='Proyecto sin plan operativo registrado'
                        buttonText={'Crear plan operativo'}
                        onButtonClick={handleAddRow}
                        sx={{ height: "60vh" }}
                    />
                ) : (
                    projectId && (
                        <Box
                            sx={{
                                overflowX: 'auto',
                                width: { xs: '100%', sm: '100%' },
                                pb: 1,
                                "&::-webkit-scrollbar": { height: "2px" },
                                "&::-webkit-scrollbar-track": {
                                    backgroundColor: theme.palette.background.default,
                                    borderRadius: "2px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: theme.palette.primary.main,
                                    borderRadius: "2px",
                                },
                                "&::-webkit-scrollbar-thumb:hover": {
                                    backgroundColor: theme.palette.primary.dark,
                                },
                            }}>
                            <Grid
                                container
                                spacing={2}
                                sx={{ minWidth: '1020px' }}
                            >
                                {columns.map(({ title, key, component: Component }) => (
                                    <Grid
                                        key={key}
                                        size={{
                                            xs: 2,
                                            sm: 2,
                                            md: 2,
                                            lg: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 40 }}
                                        >
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {title}
                                            </Typography>
                                        </Box>
                                        <Divider sx={{ mb: 1 }} />
                                        {rows.map((row, index) => (
                                            <Box
                                                key={index}
                                                onMouseEnter={() => handleMouseEnter(index)}
                                                onMouseLeave={handleMouseLeave}
                                                onContextMenu={(e) => handleContextMenu(e, index)}

                                                sx={{
                                                    backgroundColor: hoveredRow === index ? theme.palette.mode === 'light'
                                                        ? 'rgba(0, 0, 0, 0.05)'
                                                        : 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                                    borderRadius: 1,
                                                    padding: 0.5,
                                                    transition: 'background-color 0.2s',
                                                    cursor: 'pointer',
                                                    height: 200,
                                                    minWidth: 160,
                                                    marginBottom: 1
                                                }}
                                            >
                                                <Component
                                                    value={row[key]}
                                                    index={index}
                                                    sx={{ height: "100%", overflow: 'auto' }}
                                                />
                                            </Box>
                                        ))}
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                                <Tooltip
                                    title="Añadir fila"
                                    arrow
                                    componentsProps={{
                                        tooltip: {
                                            sx: {
                                                fontSize: '0.8rem',
                                                backgroundColor: 'rgba(0,0,0,0.75)',
                                                color: 'white',
                                                px: 2,
                                                py: 0.5
                                            },
                                        },
                                    }}
                                >
                                    <IconButton
                                        onClick={handleAddRow}
                                        color="primary"
                                        sx={{
                                            borderRadius: '50%',
                                            width: 50,
                                            height: 50,
                                            padding: 0,
                                            '&:hover': {
                                                backgroundColor: 'rgba(25, 118, 210, 0.15)',
                                                borderRadius: '50%',
                                            },
                                        }}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    ))}
            </Box >

            <Menu
                open={contextMenu !== null}
                onClose={() => setContextMenu(null)}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                <MenuItem onClick={handleDeleteRow}>Eliminar fila</MenuItem>
            </Menu>
        </>
    );
};

export default OperationalPlanningTable;
