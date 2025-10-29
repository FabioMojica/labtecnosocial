import { useEffect, useState } from "react";
import {
  Box, Typography, CircularProgress, FormControl, TextField, Autocomplete, IconButton, Tooltip
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import ExportMenu from "./components/ExportMenu.jsx";
import { useNotification } from "../../contexts/ToastContext.jsx";
import { formatDate } from "../../utils/formatDate.js";

import { getAllOperationalProjectsApi, getOperationalPlanOfProjectApi } from "../../api";

const defaultColumns = [
  {
    field: 'objective',
    headerName: 'Objetivo',
    flex: 2,
    minWidth: 200,
    sortable: false,
    renderCell: (params) => {
      const objective = params.value || null;
      return (
        <div style={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: 1.4,
          width: '100%'
        }}>
          {objective}
        </div>
      );
    }
  },

  {
    field: 'indicator',
    headerName: 'Indicador',
    flex: 1.5,
    minWidth: 150,
    sortable: false,
    renderCell: (params) => {
      const { quantity = '', concept = '' } = params.value || {};
      if (!quantity && !concept) return null;

      return (
        <div style={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: 1.4,
          width: '100%'
        }}>
          <div><strong>Cantidad:</strong> {quantity}</div>
          <div><strong>Concepto:</strong> {concept}</div>
        </div>
      );
    }
  },
  {
    field: 'team',
    headerName: 'Equipo',
    flex: 1.5,
    minWidth: 150,
    sortable: false,
    renderCell: (params) => {
      const team = params.value || [];
      if (!Array.isArray(team) || team.length === 0) return null;
      return (

        <div style={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: 1.4,
          width: '100%'
        }}>
          <ol>
            {team.map((member, index) => (
              <li key={index} style={{ lineHeight: 1.2 }}><strong>{index + 1}. </strong> {member}</li>
            ))}
          </ol>
        </div>
      );
    }
  },
  {
    field: 'resources',
    headerName: 'Recursos',
    flex: 1.5,
    minWidth: 150,
    sortable: false,
    renderCell: (params) => {
      const resources = params.value || [];
      if (!Array.isArray(resources) || resources.length === 0) return null;
      return (
        <div style={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: 1.4,
          width: '100%'
        }}>
          <ol>
            {resources.map((res, index) => (
              <li key={index} style={{ lineHeight: 1.2 }}><strong>{index + 1}. </strong> {res}</li>
            ))}
          </ol>
        </div>
      );
    }
  },
  {
    field: 'budget',
    headerName: 'Presupuesto',
    flex: 1.5,
    minWidth: 150,
    sortable: false,
    renderCell: (params) => {
      const { amount = '', description = '' } = params.value || {};
      if (!amount && !description) return null;

      return (
        <div style={{
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          lineHeight: 1.4,
          width: '100%'
        }}>
          <div><strong>Monto:</strong> {amount}</div>
          <div><strong>Descripción:</strong> {description}</div>
        </div>
      );
    }
  },
  {
    field: 'period',
    headerName: 'Periodo',
    flex: 1,
    minWidth: 150,
    sortable: false,
    renderCell: (params) => {
    const { start = '', end = '' } = params.value || {};

    if (!start && !end) return null;

    return (
      <div style={{
        whiteSpace: 'normal',
        wordBreak: 'break-word',
        lineHeight: 1.4,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div>
          <strong>Inicio:</strong>
          <div>{formatDate(start)}</div>
        </div>
        <div>
          <strong>Fin:</strong>
          <div>{formatDate(end)}</div>
        </div>
      </div>
    );
  },
  }

];

const handleExportExcel = () => {

}

const handleExportPDF = () => {

}

const OperationalPlanningReadOnlyTable = ({ projectId, onProjectIdChange }) => {
  const [projects, setProjects] = useState([]);
  const [loadingProjectsList, setLoadingProjectsList] = useState(false);
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [gridKey, setGridKey] = useState(0);
  const [hasLoadError, setHasLoadError] = useState(false);
  const notify = useNotification();

  const handleProjectChange = (newId) => {
    if (onProjectIdChange) {
      onProjectIdChange(Number(newId));
    }
    if (!newId) {
      setRows([]);
      return;
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjectsList(true);
      try {
        const projectsData = await getAllOperationalProjectsApi();
        setProjects(projectsData);
      } catch (error) {
        notify('Error obteniendo los proyectos. Inténtalo de nuevo más tarde.', 'error')
      } finally {
        setLoadingProjectsList(false);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setRows([]);
      return;
    }

    const loadRows = async () => {
      setLoadingRows(true);
      try {
        const res = await getOperationalPlanOfProjectApi(projectId);

        const transformedRows = res.map(row => ({
          id: row.id,
          objective: row.objective ?? '',
          indicator: {
            quantity: row.indicator_amount ?? '',
            concept: row.indicator_concept ?? ''
          },
          team: Array.isArray(row.team) ? row.team : [],
          resources: Array.isArray(row.resources) ? row.resources : [],
          budget: {
            amount: row.budget_amount ?? '',
            description: row.budget_description ?? ''
          },
          period: {
            start: row.period_start ?? '',
            end: row.period_end ?? ''
          },
        }));

        setRows(transformedRows);
        setHasLoadError(false);
      } catch (error) {
        setHasLoadError(true);
        notify('Error al obtener la planificacíon operativa del proyecto. Inténtalo de nuevo más tarde.', 'error');
      } finally {
        setLoadingRows(false);
      }
    };

    loadRows();
  }, [projectId]);

  const resetColumnWidths = () => {
    setGridKey(prev => prev + 1);
  };

  if (hasLoadError) {
    return null; 
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 300 }}>
          {!loadingProjectsList && projects.length > 0 ? (
            <Autocomplete
              options={projects}
              getOptionLabel={(option) => option.name || ""}
              value={projects.find(p => p.id === Number(projectId)) || null}
              onChange={(event, newValue) => {
                const newId = newValue ? newValue.id : "";
                handleProjectChange(Number(newId));
              }}
              renderInput={(params) => (
                <TextField {...params} label="Seleccionar proyecto" placeholder="Buscar proyecto..." />
              )}
            />
          ) : (
            <TextField label="Proyecto" placeholder="Cargando proyectos..." disabled />
          )}
        </FormControl>

        {(!loadingRows && Array.isArray(rows) && rows.length > 0) && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>

            <ExportMenu
              onExportExcel={() => { /* función export excel aquí */ }}
              onExportPDF={() => { /* función export pdf aquí */ }}
            />

            <Tooltip title="Resetear anchos a por defecto">
              <IconButton onClick={resetColumnWidths} size="small" aria-label="reset column widths">
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
          </Box>)
        }
      </Box>


      {loadingRows ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
          <CircularProgress />
        </Box>
      ) : !rows.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 10 }}>
          <Typography variant="body1" color="text.secondary">
            {projectId && "No hay datos para mostrar."}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 'auto', width: '100%' }}>
          <DataGrid
            key={gridKey}
            rows={rows}
            columns={defaultColumns}
            getRowId={(row) => row.id}
            getRowHeight={() => 'auto'}
            pageSize={10}
            rowSelection={false}
            disableSelectionOnClick
            disableColumnMenu
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#1976d2',
                color: 'black',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #e0e0e0',
                borderRight: '1px solid #e0e0e0',
                padding: '12px',
              },
              '& .MuiDataGrid-cell:last-child': {
                borderRight: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#e3f2fd',
              },
              borderRadius: 2,
              boxShadow: 1,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default OperationalPlanningReadOnlyTable;