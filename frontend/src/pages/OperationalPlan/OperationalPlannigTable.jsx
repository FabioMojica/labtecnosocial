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

import { formatRow, isRowEmpty, removeRowIfEmpty } from './utils/rowsFuncions';
import { useNotification } from '../../contexts';
import { ButtonWithLoader, ErrorScreen, FullScreenProgress, NoResultsScreen, SearchBar } from '../../generalComponents';
import { useFetchAndLoad } from '../../hooks';
import { getDrawerClosedWidth } from '../../utils';
import { useDirty } from '../../contexts/DirtyContext';
import { formatDate } from '../../utils/formatDate';

const OperationalPlanningTable = ({ projectId, project, onProjectWithoutPlan, projectWithoutPlan, onUnsavedChanges, onErrorFetchedPlan, onProjectLoading }) => {

    const confirm = useConfirm();
    const theme = useTheme();

    const { loading, callEndpoint } = useFetchAndLoad();
    const { notify } = useNotification();

    const [rows, setRows] = useState([]);
    const rowRefs = useRef({});

    const [initialRows, setInitialRows] = useState([]);
    const initialRowsRef = useRef(initialRows);
    const currentRowsRef = useRef(rows);

    const [planInfo, setPlanInfo] = useState({ operationalPlan_created_at: null, operationalPlan_updated_at: null, operationalPlan_version: 0 });

    const [contextMenu, setContextMenu] = useState(null);
    const [loadingProjectDetails, setLoadingProjectDetails] = useState(false);
    const [hasLoadError, setHasLoadError] = useState(false);

    const [isFullscreen, setIsFullscreen] = useState(false);

    const headerRef = useRef(null);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('down');

    const [canScroll, setCanScroll] = useState(false);

    const containerRef = useRef(null);

    const { setIsDirtyContext, registerAutoSave } = useDirty();

    const [highlightedRowKey, setHighlightedRowKey] = useState(null);

    const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

    const hasUnsavedChanges = !isEqual(rows, initialRows);
    const hasChanges = () => !isEqual(rows, initialRows);

    useEffect(() => {
        if (typeof onUnsavedChanges === 'function') {
            onUnsavedChanges(hasUnsavedChanges);
        }
    }, [hasUnsavedChanges, onUnsavedChanges]);

    useEffect(() => {
        if (hasUnsavedChanges) {
            setIsDirtyContext(true);
        } else {
            setIsDirtyContext(false);
        }
    }, [hasUnsavedChanges]);

    useEffect(() => {
        currentRowsRef.current = rows;
    }, [rows]);

    useEffect(() => {
        initialRowsRef.current = initialRows;
    }, [initialRows]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [rows, initialRows]);

    useEffect(() => {
        if (headerRef.current) {
            const height = headerRef.current.getBoundingClientRect().height;
        }
    }, [isFullscreen]);

    const handleScrollAction = () => {
        const container = isFullscreen ? containerRef.current : window;

        if (scrollDirection === 'up') {
            if (isFullscreen) {
                container.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else {
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
        if (!highlightedRowKey) return;

        const ref = rowRefs.current[highlightedRowKey];
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

        const timeout = setTimeout(() => {
            setHighlightedRowKey(null);
        }, 1000);

        return () => clearTimeout(timeout);
    }, [rows, highlightedRowKey, isFullscreen]);

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

    const fetchProjectDetails = async () => {
        setLoadingProjectDetails(true);
        onProjectLoading(true);
        try {
            const response = await getOperationalPlanOfProjectApi(projectId);

            console.log("responseeeeeee", response)

            const res = response?.rows;
            setPlanInfo({
                operationalPlan_created_at: response?.operationalPlan_created_at || null,
                operationalPlan_updated_at: response?.operationalPlan_updated_at || null,
                operationalPlan_version: response?.operationalPlan_version || 0
            });

            if (Array.isArray(res) && res.length === 0 && res?.operationalPlan_created_at == null) {
                onProjectWithoutPlan(true);
            } else {
                onProjectWithoutPlan(false);
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
            onErrorFetchedPlan(false);
        } catch (error) {
            onErrorFetchedPlan(true);
            setHasLoadError(true);
            console.log(error)
        } finally {
            setLoadingProjectDetails(false);
            onProjectLoading(false);
        }
    };

    useEffect(() => {
        console.log("ilalalalalala")
        fetchProjectDetails();
    }, [projectId, projectWithoutPlan]);

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
                    setRows(prev => {
                        const updated = prev.map((row, i) =>
                            i === index ? { ...row, [key]: '' } : row
                        );
                        return removeRowIfEmpty(updated, index);
                    });
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
                    setRows(prev => {
                        const updated = prev.map((row, i) =>
                            i === index ? { ...row, [key]: '' } : row
                        );
                        return removeRowIfEmpty(updated, index);
                    });
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
                    setRows(prev => {
                        const updated = prev.map((row, i) =>
                            i === index ? { ...row, [key]: [] } : row
                        );
                        return removeRowIfEmpty(updated, index);
                    });
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
                    setRows(prev => {
                        const updated = prev.map((row, i) =>
                            i === index ? { ...row, [key]: [] } : row
                        );
                        return removeRowIfEmpty(updated, index);
                    });
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
                    setRows(prev => {
                        const updated = prev.map((row, i) =>
                            i === index ? { ...row, [key]: '' } : row
                        );
                        return removeRowIfEmpty(updated, index);
                    });
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
                    setRows(prev => {
                        const updated = prev.map((row, i) =>
                            i === index ? { ...row, [key]: '' } : row
                        );
                        return removeRowIfEmpty(updated, index);
                    });
                }
            })
            .catch(() => { });
    };
    // ppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp

    const handleAddRow = () => {
        if (!projectId) return;

        const tempId = crypto.randomUUID();

        setRows(prev => [
            ...prev,
            {
                _tempId: tempId,
                objective: '',
                indicator: { quantity: '', concept: '' },
                team: [],
                resource: [],
                budget: { amount: '', description: '' },
                period: { start: '', end: '' },
            },
        ]);

        setHighlightedRowKey(tempId);
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
        if (isAnyModalOpen) return;

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
        },
        {
            title: 'Indicador',
            key: 'indicator',
        },
        {
            title: 'Equipo',
            key: 'team',
        },
        {
            title: 'Recursos',
            key: 'resource',
        },
        {
            title: 'Presupuesto',
            key: 'budget',
        },
        {
            title: 'Periodo',
            key: 'period',
        },
    ];

    useEffect(() => {
        if (headerRef.current) {
            const height = headerRef.current.getBoundingClientRect().height;
        }
    }, [isFullscreen]);


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

    useEffect(() => {
        const container = isFullscreen ? containerRef.current : window;
        if (!container) return;

        container.addEventListener('scroll', checkScrollPosition);

        checkScrollPosition();

        return () => container.removeEventListener('scroll', checkScrollPosition);
    }, [isFullscreen]);


    const handleSave = async (autoSave = false) => {
        const rows = currentRowsRef.current;
        const initialRows = initialRowsRef.current;

        if (rows.length === 1 && isRowEmpty(rows[0])) {
            return;
        }

        const validRows = rows.filter(row => !isRowEmpty(row));
        const formattedRows = validRows.map(formatRow);
        const formattedInitialRows = initialRows.map(formatRow);

        const initialMap = new Map(formattedInitialRows.map(r => [r.id, r]));
        const currentMap = new Map(formattedRows.map(r => [r.id, r]));
        const rowsToCreate = formattedRows.filter(r => !r.id);
        const rowsToUpdate = formattedRows.filter(r => {
            if (!r.id) return false;
            return !isEqual(initialMap.get(r.id), r);
        });
        const rowsToDelete = [
            ...formattedInitialRows.filter(r => !currentMap.has(r.id)),
            ...formattedInitialRows.filter(r => {
                const current = rows.find(row => row.id === r.id);
                return current && isRowEmpty(current);
            }),
        ];

        try {
            const tempIdMap = new Map(
                rows
                    .filter(r => !r.id && r._tempId)
                    .map(r => [r._tempId, r])
            );

            const orderMap = new Map(
                rows.map((row, index) => [row.id ?? row._tempId, index])
            );

            const resp = await callEndpoint(saveOperationalRowsApi(projectId, {
                operationalPlan_version: planInfo.operationalPlan_version,
                create: rowsToCreate,
                update: rowsToUpdate,
                delete: rowsToDelete.map(r => r.id).filter(Boolean),
            }));


            const response = resp?.savedRows;

            if (Array.isArray(response) && resp.length === 0 && resp?.operationalPlan_created_at == null) {
                onProjectWithoutPlan(true);
            } else {
                onProjectWithoutPlan(false);
            }

            setPlanInfo({
                operationalPlan_created_at: resp?.operationalPlan_created_at,
                operationalPlan_updated_at: resp?.operationalPlan_updated_at,
                operationalPlan_version: resp?.operationalPlan_version
            });

            const updatedRows = response
                .map(row => {
                    const original = rows.find(r =>
                        r.id === row.id ||
                        (!r.id && r._tempId && tempIdMap.has(r._tempId))
                    );

                    return {
                        id: row.id,
                        _tempId: original?._tempId,
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
                    };
                })
                .sort((a, b) => {
                    const aKey = a.id ?? a._tempId;
                    const bKey = b.id ?? b._tempId;
                    return (orderMap.get(aKey) ?? Infinity) - (orderMap.get(bKey) ?? Infinity);
                });

            setHighlightedRowKey(null);
            setRows(updatedRows);
            setInitialRows(cloneDeep(updatedRows));

            if (!autoSave) notify('Plan operativo guardado correctamente.', 'success');

        } catch (error) {
            console.error('Error guardando plan:', error);

            if (error.message?.includes('asegúrate de estar trabajando sobre la última versión del plan')) {
                if (!autoSave) notify('No se actualizó el plan estratégico por que no estás trabajando sobre su última versión.', 'error', { persist: true });
            } else {
                if (!autoSave)
                    notify(
                        "Ocurrió un error inesperado al guardar el plan estratégico. Inténtalo de nuevo más tarde.",
                        'error'
                    );
            }
        }
    };

    useEffect(() => {
        registerAutoSave(async () => {
            await handleSave(true);
        });
    }, []);

    const hasEmptyRow = rows.some(row => isRowEmpty(row));


    if (loadingProjectDetails) {
        return (
            <FullScreenProgress text={"Obteniendo el plan operativo"} />
        ); 
    } 

    if (hasLoadError) {
        return (
            <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center', px: 1 }}>
                <Divider sx={{ width: '100%' }} />
                <ErrorScreen
                    message="Ocurrió un error al obtener el plan operativo del proyecto"
                    buttonText="Intentar de nuevo"
                    onButtonClick={() => fetchProjectDetails()}
                    sx={{ height: "60vh", p: 2 }}
                />
            </Box>
        );
    }

    if (projectWithoutPlan && !loadingProjectDetails && rows.length === 0) {
        return (
            <Box sx={{ width: '100%', justifyContent: 'center', alignItems: 'center', px: 1 }}>
                <Divider sx={{ width: '100%' }} />
                <NoResultsScreen
                    message='Proyecto sin plan operativo registrado'
                    buttonText="Crear plan operativo"
                    onButtonClick={() => handleAddRow()}
                    sx={{ height: "60vh", p: 2 }}
                    buttonSx={{
                        backgroundColor: "primary.main",
                        color: "primary.contrastText",
                        "&:hover": {
                            backgroundColor: "primary.dark",
                        },
                        "&.Mui-disabled": {
                            backgroundColor: "action.disabledBackground",
                            color: "action.disabled",
                        },
                    }}
                />
            </Box>
        )
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: isFullscreen ? 'fixed' : 'relative',
                    top: isFullscreen ? 0 : 'auto',
                    left: isFullscreen ? 0 : 'auto',
                    width: isFullscreen ? '100vw' : '100%',
                    height: isFullscreen ? '100vh' : 'auto',
                    bgcolor: (theme) => theme.palette.background.default,
                    zIndex: isFullscreen ? 1500 : 'auto',
                    overflow: isFullscreen ? 'auto' : 'visible',
                    maxWidth: { xs: '100vw', lg: '100%' }
                }}
            >
                {rows.length > 0 && projectId && (
                    <>
                        <Box
                            ref={headerRef}
                            sx={{
                                position: isFullscreen ? 'relative' : 'sticky',
                                top: isFullscreen ? 0 : 64,
                                zIndex: isFullscreen ? 1600 : 999,
                                bgcolor: 'background.paper',
                                borderTopLeftRadius: 8,
                                borderTopRightRadius: 8,
                                borderBottom: 'none',
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

                                <Box sx={{
                                    display: {
                                        lg: 'none'
                                    },
                                    justifyContent: 'center',
                                    mt: 1
                                }}>
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
                                        <span>
                                            <IconButton
                                                onClick={handleAddRow}
                                                disabled={hasEmptyRow}
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
                                        </span>
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
                                {hasUnsavedChanges && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        sx={{ width: '170px', height: '100%' }}
                                        onClick={() => handleDiscardChanges()}
                                        disabled={loading}
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
                                    sx={{
                                        color: 'white', px: 2, width: '170px',
                                        display: (hasChanges()) ? 'block' : 'none',
                                    }}
                                >
                                    Guardar Plan
                                </ButtonWithLoader>
                            </Box>
                        </Box>
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
                                border: '1px solid',
                                borderTop: 'none',
                                borderBottom: '1px solid',
                                borderLeft: '1px solid',
                                borderRight: '1px solid',
                                borderColor: 'divider',
                                borderBottomLeftRadius: !planInfo?.operationalPlan_created_at ? 10 : 0,
                                borderBottomRightRadius: !planInfo?.operationalPlan_created_at ? 10 : 0,
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
                                        key={row.id ?? row._tempId}
                                        ref={(el) => (rowRefs.current[row.id ?? row._tempId] = el)}
                                        className={
                                            highlightedRowKey === (row.id ?? row._tempId)
                                                ? 'flash-highlight'
                                                : ''
                                        }
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
                                            setGlobalModalOpen={setIsAnyModalOpen}
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
                                            setGlobalModalOpen={setIsAnyModalOpen}
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
                                            setGlobalModalOpen={setIsAnyModalOpen}
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
                                            setGlobalModalOpen={setIsAnyModalOpen}
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
                                            setGlobalModalOpen={setIsAnyModalOpen}
                                            value={row['budget']}
                                            onUpdate={(newText) =>
                                                handleUpdateBudgetItem(index, newText)
                                            }
                                            onDelete={() =>
                                                handleDeleteBudgetItem(index, 'budget')
                                            }
                                            sx={{ height: "100%", overflow: 'auto' }}
                                        />
                                        <PeriodItem
                                            setGlobalModalOpen={setIsAnyModalOpen}
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
                                    <span>
                                        <IconButton
                                            onClick={handleAddRow}
                                            disabled={hasEmptyRow}
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
                                    </span>
                                </Tooltip>
                            </Box>
                        </Box>

                    </>
                )}
            </Box>
            {(planInfo?.operationalPlan_created_at && planInfo?.operationalPlan_updated_at && planInfo?.operationalPlan_version !== 0) && (
                    <Box sx={{
                        bgcolor: 'background.paper',
                        width: '100%',
                        borderBottomRightRadius: 6,
                        borderBottomLeftRadius: 6,
                        p: 1,
                        display: 'flex',
                        flexDirection: {
                            xs: 'column',
                            lg: 'row'
                        },
                        justifyContent: 'space-between',
                        mb: 1
                    }}>
                        {planInfo?.operationalPlan_created_at && planInfo?.operationalPlan_updated_at && (
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography fontWeight="bold" variant='caption'>
                                    Fecha de creación:{" "}
                                    <Typography
                                        component="span"
                                        variant="body1"
                                        color="textSecondary"
                                        sx={{
                                            fontStyle: 'italic',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {formatDate(planInfo?.operationalPlan_created_at)}
                                    </Typography>
                                </Typography>
                                <Typography fontWeight="bold" variant='caption'>
                                    Fecha de actualización:{" "}
                                    <Typography
                                        component="span"
                                        variant="body1"
                                        color="textSecondary"
                                        sx={{
                                            fontStyle: 'italic',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {formatDate(planInfo?.operationalPlan_updated_at)}
                                    </Typography>
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'row', lg: 'column' },
                            gap: { xs: 1, lg: 0 },
                            alignItems: 'center'
                        }}>
                            <Typography fontWeight="bold" variant='caption'>
                                Versión del plan:{" "}
                            </Typography>
                            <Typography
                                component="span"
                                variant="body1"
                                color="textSecondary"
                                sx={{
                                    fontStyle: 'italic',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {planInfo?.operationalPlan_version}
                            </Typography>
                        </Box>
                    </Box>
                )}

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
