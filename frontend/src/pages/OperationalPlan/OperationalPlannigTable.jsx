import { useState, useEffect, useRef } from 'react';
import { Box, Divider, Button, Typography, IconButton, Grid, useTheme, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useConfirm } from 'material-ui-confirm';
import { Menu, MenuItem, Tooltip } from '@mui/material';
import ObjectiveItem from './components/objective/ObjetiveItem';
import IndicatorItem from './components/indicator/IndicatorItem';
import TeamItem from './components/team/TeamItem';
import ResourceItem from './components/resource/ResourceItem';
import BudgetItem from './components/budget/BudgetItem';
import PeriodItem from './components/period/PeriodItem';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import isEqual from "lodash.isequal";
import cloneDeep from "lodash/cloneDeep";

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';

import { getOperationalPlanOfProjectApi, saveOperationalRowsApi } from '../../api';

import { isRowEmpty, toNullableNumber } from './utils/rowsFuncions';
import { useNotification } from '../../contexts';
import { ButtonWithLoader, ErrorScreen, FullScreenProgress, NoResultsScreen, SearchBar } from '../../generalComponents';
import { useFetchAndLoad } from '../../hooks';
import { getDrawerClosedWidth } from '../../utils';

const OperationalPlanningTable = ({ projectId, project, onProjectWithoutPlan, onProjectHasPlan, onEditingChange, hasPlan, onLoadError }) => {
    const confirm = useConfirm();
    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();
    const [rows, setRows] = useState([]);
    const [hoveredRow, setHoveredRow] = useState(null);
    const theme = useTheme();
    const [contextMenu, setContextMenu] = useState(null);

    console.log(project)

    const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
    const [saving, setSaving] = useState(false);
    const [initialRows, setInitialRows] = useState([]);
    const [hasLoadError, setHasLoadError] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(false);

    const headerRef = useRef(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down');

    const [canScroll, setCanScroll] = useState(false);

    const containerRef = useRef(null);

    const rowRefs = useRef({});
    const [highlightedRowIndex, setHighlightedRowIndex] = useState(null);

    useEffect(() => {
        if (headerRef.current) {
            const height = headerRef.current.getBoundingClientRect().height;
        }
    }, [isFullscreen]);

    const handleScrollAction = () => {
        const container = isFullscreen ? containerRef.current : window;

        if (scrollDirection === 'up') {
            // Scroll al inicio
            if (isFullscreen) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
            // Scroll al final
            if (isFullscreen) {
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            } else {
                const scrollHeight = Math.max(
                    document.body.scrollHeight,
                    document.documentElement.scrollHeight
                );
                window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        if (highlightedRowIndex === null) return;

        const ref = rowRefs.current[highlightedRowIndex];
        if (!ref) return;

        const container = isFullscreen ? containerRef.current : window;

        const elementTop =
            ref.getBoundingClientRect().top +
            (isFullscreen ? container.scrollTop : window.scrollY);

        const offset = headerRef.current?.offsetHeight || 0;

        const scrollTo = elementTop - offset - 40;

        if (isFullscreen) {
            container.scrollTo({ top: scrollTo, behavior: 'smooth' });
        } else {
            window.scrollTo({ top: scrollTo, behavior: 'smooth' });
        }

        // quitar highlight después de la animación
        const timeout = setTimeout(() => {
            setHighlightedRowIndex(null);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [rows, highlightedRowIndex, isFullscreen]);


    const checkScrollPosition = () => {
        const container = isFullscreen ? containerRef.current : document.documentElement;

        if (!container) return;

        const scrollTop = isFullscreen ? container.scrollTop : window.scrollY;
        const clientHeight = isFullscreen ? container.clientHeight : window.innerHeight;
        const scrollHeight = isFullscreen
            ? container.scrollHeight
            : document.documentElement.scrollHeight;

        if (scrollHeight <= clientHeight + 2) {
            setCanScroll(false);
            setScrollDirection('down');
            return;
        } else {
            setCanScroll(true);
        }

        // Si estamos al fondo → flecha arriba
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            setScrollDirection('up');
        } else {
            setScrollDirection('down');
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            checkScrollPosition();
        });

        observer.observe(container);

        return () => observer.disconnect();
    }, [isFullscreen, rows]);

    useEffect(() => {
        if (!projectId || !hasPlan) {
            setRows([]);
            setInitialRows([]);
        }
    }, [projectId, hasPlan]);

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
            if (onLoadError) onLoadError(false);
        } catch (error) {
            setHasLoadError(true);
            console.log(error)
            if (onLoadError) onLoadError(true);
        } finally {
            setLoadingProjectDetails(false);
        }
    };

    useEffect(() => {
        if (!projectId) {
            setRows([]);
            setInitialRows([]);
            return;
        }

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

        setRows(prev => {
            const newIndex = prev.length;

            setHighlightedRowIndex(newIndex);

            return [
                ...prev,
                {
                    objective: '',
                    indicator: { quantity: '', concept: '' },
                    team: [],
                    resource: [],
                    budget: { amount: '', description: '' },
                    period: { start: '', end: '' },
                },
            ];
        });
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
                // <TextField sx={{backgroundColor: 'red'}}/>
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

    useEffect(() => {
        if (headerRef.current) {
            const height = headerRef.current.getBoundingClientRect().height;
        }
    }, [isFullscreen]);

    const hasChanges = () => !isEqual(rows, initialRows);

    useEffect(() => {
        console.log("cambio")
        if (onEditingChange) {
            onEditingChange(hasChanges());
        }
        console.log("false")
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

    const isDirty = hasChanges() || rows.some(row => isRowEmpty(row));

    useEffect(() => {
        const container = isFullscreen ? containerRef.current : window;
        if (!container) return;

        container.addEventListener('scroll', checkScrollPosition);

        checkScrollPosition();

        return () => container.removeEventListener('scroll', checkScrollPosition);
    }, [isFullscreen]);


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
        return <ErrorScreen sx={{
            height: '60vh'
        }} message="Ocurrió un error al obtener el plan operativo del proyecto" buttonText="Intentar de nuevo" onButtonClick={() => fetchProjectDetails()} />
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    position: isFullscreen ? 'fixed' : 'relative',
                    top: isFullscreen ? 0 : 'auto',
                    left: isFullscreen ? 0 : 'auto',
                    width: isFullscreen ? '100vw' : '100%',
                    height: isFullscreen ? '100vh' : 'auto',
                    bgcolor: (theme) => theme.palette.background.default,
                    zIndex: isFullscreen ? 1500 : 'auto',
                    overflow: isFullscreen ? 'auto' : 'visible',
                    gap: 1,
                    maxWidth: {
                        xs: '100vw',
                        sm: isFullscreen ? '100vw' : `calc(100vw - ${getDrawerClosedWidth(theme, 'sm')} - 8px)`,
                        md: isFullscreen ? '100vw' : `calc(100vw - ${getDrawerClosedWidth(theme, 'sm')} - 8px)`,
                        lg: isFullscreen ? '100vw' : `calc(100vw - ${getDrawerClosedWidth(theme, 'sm')} - 24px)`,
                        xl: isFullscreen ? '100vw' : `calc(100vw - ${getDrawerClosedWidth(theme, 'sm')} - 8px)`,
                    },
                }}
            >

                <Box
                    ref={headerRef}
                    sx={{
                        position: isFullscreen ? 'relative' : 'sticky',
                        top: isFullscreen ? 0 : 64,
                        zIndex: isFullscreen ? 1600 : 999,
                        bgcolor: 'background.paper',
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        p: 1,
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: {
                            xs: 'column',
                            md: 'row',
                        },
                        gap: 1
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: {
                            xs: 'column',
                            sm: 'row',
                            md: 'row',
                            lg: 'row'
                        },
                        gap: 1
                    }}>
                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            justifyContent: {
                                xs: 'space-between',
                                sm: 'left'
                            },
                            width: '100%',
                            alignItems: 'center'
                        }}>
                            <Tooltip
                                title={isFullscreen ? "Minimizar" : "Maximizar"}
                                open={tooltipOpen}
                                onOpen={() => setTooltipOpen(true)}
                                onClose={() => setTooltipOpen(false)}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setIsFullscreen(!isFullscreen);
                                        setTooltipOpen(false);
                                    }}
                                    sx={{
                                        transition: 'transform 0.3s ease',
                                        transform: isFullscreen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    }}
                                >
                                    {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="medium" />}
                                </IconButton>
                            </Tooltip>

                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                textAlign="center"
                                sx={{
                                    fontSize: {
                                        xs: '1rem',
                                        sm: '1.3rem',
                                    },
                                    maxWidth: 300,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {`Plan Operativo ${project?.name}`}
                            </Typography>


                            <Tooltip title={scrollDirection === 'up' ? 'Ir arriba' : 'Ir abajo'}>
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={handleScrollAction}
                                        disabled={!canScroll}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            opacity: 1,
                                            transform: scrollDirection === 'up'
                                                ? 'rotate(180deg)'
                                                : 'rotate(0deg)',

                                            transition: `
                        transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                        background-color 0.2s ease
                      `,

                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                        }}
                                    >
                                        <KeyboardArrowDownIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>

                        <Box sx={{ display: { xs: 'flex', lg: 'none' }, justifyContent: 'center', mt: 1 }}>
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


                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        height: '48px',
                    }}>
                        {!hasChanges() || rows.some(row => isRowEmpty(row)) && (
                            <Button
                                variant="contained"
                                color="error"
                                sx={{ width: '170px', height: '100%' }}
                                onClick={() => handleDiscardChanges()}
                            >
                                Descartar cambios
                            </Button>
                        )}
                        <ButtonWithLoader
                            loading={loading}
                            onClick={() => handleSave(false)}
                            disabled={!hasChanges() || rows.some(row => isRowEmpty(row))}
                            variant="contained"
                            backgroundButton={theme => theme.palette.success.main}
                            sx={{ color: 'white', px: 2, width: '170px' }}
                        >
                            Guardar Plan
                        </ButtonWithLoader>
                    </Box>
                </Box>

                {rows.length === 0 && !loadingProjectDetails && projectId ? (
                    <NoResultsScreen
                        message='Proyecto sin plan operativo registrado'
                        buttonText={'Crear plan operativo'}
                        onButtonClick={handleAddRow}
                        sx={{ height: "60vh", p: 2 }}
                    />
                ) : (
                    projectId && (
                        <Box
                            ref={containerRef}
                            sx={{
                                overflowX: 'auto',
                                width: '100%',
                                pb: 1,
                                "&::-webkit-scrollbar": { height: "2px", width: "2px" },
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
                            <Box
                                sx={{
                                    width: '100%',
                                    minWidth: '1020px',
                                    px: 1,
                                    pb: 1,
                                    flex: isFullscreen ? 1 : 'unset',
                                    overflowY: isFullscreen ? 'auto' : 'visible',
                                }}
                                justifyContent="center"
                            >
                                {/* === HEADERS === */}
                                <Grid container>
                                    {columns.map(({ index, title, key }) => (
                                        <Grid
                                            key={key}
                                            size={{ xs: 2, sm: 2, md: 2, lg: 2 }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    height: 40,
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    sx={{ fontWeight: 'bold', textAlign: 'center', width: '100%' }}
                                                >
                                                    {title}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ mb: 1 }} />
                                        </Grid>
                                    ))}
                                </Grid>

                                {/* === FILAS === */}
                                {rows.map((row, index) => (
                                    <Box
                                        key={index}
                                        ref={(el) => (rowRefs.current[index] = el)}
                                        className={highlightedRowIndex === index ? 'flash-highlight' : ''}
                                        onContextMenu={(e) => handleContextMenu(e, index)}
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(6, minmax(160px, 1fr))',
                                            gap: 1,
                                            borderRadius: 1,
                                            padding: 0.5,
                                            marginBottom: 1,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease',
                                            '&:hover': {
                                                backgroundColor:
                                                    theme.palette.mode === 'light'
                                                        ? 'rgba(0, 0, 0, 0.05)'
                                                        : 'rgba(255, 255, 255, 0.08)',
                                            },
                                            height: 230
                                        }}
                                    >
                                        <ObjectiveItem
                                            value={row['objective']}
                                            onUpdate={(newText) =>
                                                handleUpdateObjetiveItem(index, 'objective', newText)
                                            }
                                            onDelete={() =>
                                                handleDeleteObjetiveItem(index, 'objective')
                                            }
                                            sx={{ height: "100%", overflow: 'auto' }}
                                        />
                                        <IndicatorItem
                                            value={row['indicator']}
                                            onUpdate={(newText) =>
                                                handleUpdateIndicatorItem(index, 'indicator', newText)
                                            }
                                            onDelete={() =>
                                                handleDeleteIndicatorItem(index, 'indicator')
                                            }
                                            sx={{ height: "100%", overflow: 'auto' }}
                                        />
                                        <TeamItem
                                            value={row['team']}
                                            onUpdate={(newText) =>
                                                handleUpdateTeamItem(index, newText)
                                            }
                                            onDelete={() =>
                                                handleDeleteTeamItem(index, 'team')
                                            }
                                            sx={{ height: "100%", overflow: 'auto' }}
                                        />
                                        <ResourceItem
                                            value={row['resource']}
                                            onUpdate={(newText) =>
                                                handleUpdateResourceItem(index, newText)
                                            }
                                            onDelete={() =>
                                                handleDeleteResourceItem(index, 'resource')
                                            }
                                            
                                            sx={{ height: "100%", overflow: 'auto' }}
                                        />
                                        <BudgetItem
                                            value={row['budget']}
                                            onUpdate={(newText) =>
                                                handleUpdateBudgetItem(index, 'budget', newText)
                                            }
                                            onDelete={() =>
                                                handleDeleteBudgetItem(index, 'budget')
                                            }
                                            sx={{ height: "100%", overflow: 'auto' }}
                                        />
                                        <PeriodItem
                                            value={row['period']}
                                            onUpdate={(newText) =>
                                                handleUpdatePeriodItem(index, newText)
                                            }
                                            onDelete={() =>
                                                handleDeletePeriodItem(index, 'period')
                                            }
                                            sx={{ height: "100%", overflow: 'auto' }}
                                        />
                                    </Box>
                                ))}
                            </Box>

                            <Box sx={{ display: { xs: 'none', lg: 'flex' }, justifyContent: 'center', mt: 1 }}>
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
