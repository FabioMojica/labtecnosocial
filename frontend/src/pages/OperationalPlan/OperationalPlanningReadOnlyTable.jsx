import { useEffect, useState } from "react";
import {
  Box, Typography, CircularProgress, FormControl, TextField, Autocomplete, IconButton, Tooltip,
  useTheme
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import ExportMenu from "./components/ExportMenu.jsx";
import { useNotification } from "../../contexts/ToastContext.jsx";
import { formatDate } from "../../utils/formatDate.js";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { getAllOperationalProjectsApi, getOperationalPlanOfProjectApi } from "../../api";
import { NoResultsScreen } from "../../generalComponents/NoResultsScreen.jsx";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const API_BASE_URL = import.meta.env.VITE_BASE_URL;

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
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {team.map((member, index) => (
              <li key={index} style={{ lineHeight: 1.2 }}><strong>{index + 1}. </strong> {member}</li>
            ))}
          </ul>
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
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}></ul>
          {resources.map((res, index) => (
            <li key={index} style={{ lineHeight: 1.2 }}><strong>{index + 1}. </strong> {res}</li>
          ))}
          <ul />
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


const handleExportExcel = (rows, project) => {
  if (!rows || !rows.length) return;

  const ws_data = [];

  // FILA 1: encabezados principales (Objetivo, Indicador, Equipo, Recurso, Presupuesto, Periodo)
  ws_data.push([
    'Objetivo',       // A1
    'Indicador', '',  // B1:C1
    'Equipo', '',     // D1:E1
    'Recursos', '',   // F1:G1
    'Presupuesto', '',// H1:I1
    'Periodo', ''     // J1:K1
  ]);

  // FILA 2: subcolumnas
  ws_data.push([
    '',
    'Cantidad', 'Concepto',
    'Num', 'Miembro',
    'Num', 'Recurso',
    'Monto', 'Descripción',
    'Inicio', 'Fin'
  ]);

  // FILAS DE DATOS
  rows.forEach((row) => {
    const maxTeam = row.team.length || 1;
    const maxResources = row.resources.length || 1;
    const maxSubRows = Math.max(maxTeam, maxResources, 1);

    for (let i = 0; i < maxSubRows; i++) {
      ws_data.push([
        i === 0 ? row.objective : '',
        i === 0 ? row.indicator.quantity : '',
        i === 0 ? row.indicator.concept : '',
        row.team[i] ? i + 1 : '',
        row.team[i] || '',
        row.resources[i] ? i + 1 : '',
        row.resources[i] || '',
        i === 0 ? row.budget.amount : '',
        i === 0 ? row.budget.description : '',
        i === 0 ? row.period.start : '',
        i === 0 ? row.period.end : ''
      ]);
    }
    ws_data.push([]);
  });

  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // DEFINIMOS MERGES PARA LOS ENCABEZADOS
  ws['!merges'] = [
    { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }, // Indicador B1:C1
    { s: { r: 0, c: 3 }, e: { r: 0, c: 4 } }, // Equipo D1:E1
    { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } }, // Recursos F1:G1
    { s: { r: 0, c: 7 }, e: { r: 0, c: 8 } }, // Presupuesto H1:I1
    { s: { r: 0, c: 9 }, e: { r: 0, c: 10 } }, // Periodo J1:K1
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plan Operativo');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  // Reemplaza caracteres especiales y espacios por guiones bajos
  const safeName = project.name.replace(/[^a-z0-9]/gi, '_');

  saveAs(blob, `plan_operativo_proyecto_${safeName}.xlsx`);
};

const drawInitialAvatar = (doc, projectName, x, y, size) => {
  console.log("xxxxxxxxxxx.>", projectName)
  const initial = (projectName?.charAt(0) || '?').toUpperCase();

  // Círculo de fondo
  doc.setFillColor(41, 128, 185); // Azul elegante
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F');

  // Inicial centrada
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(size * 0.6);
  doc.setFont('helvetica', 'bold');
  doc.text(initial, x + size / 2 - size * 0.18, y + size / 2 + size * 0.2);
};

const handleExportPDF = async (rows, project) => {
  if (!rows || !rows.length) return;

  const doc = new jsPDF('landscape', 'pt', 'a4');

  // Fecha actual
  const now = new Date();
  const formattedDate = now.toLocaleString('es-BO', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const avatarX = 40;
  const avatarY = 30;
  const avatarSize = 40;

  let imageUrl = project.image_url;

  // Si la URL es relativa, anteponemos el dominio del backend
  if (imageUrl && imageUrl.startsWith('/uploads/')) {
    imageUrl = `${API_BASE_URL}${imageUrl}`;
  }

  // --- Dibuja avatar o imagen ---
  let titleY;
  if (imageUrl) {
    try {
      const img = await fetch(imageUrl);
      const blob = await img.blob();
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onload = () => {
          doc.addImage(reader.result, 'JPEG', avatarX, avatarY, avatarSize, avatarSize, '', 'FAST');
          resolve();
        };
        reader.readAsDataURL(blob);
      });
      titleY = avatarY + avatarSize * 0.6; // ✅ altura ideal si hay imagen
    } catch (err) {
      console.warn('⚠️ Error cargando imagen, se usará inicial:', err);
      drawInitialAvatar(doc, project.name, avatarX, avatarY, avatarSize);
      titleY = avatarY + avatarSize * 0.7; // ✅ ligeramente más bajo
    }
  } else {
    drawInitialAvatar(doc, project.name, avatarX, avatarY, avatarSize);
    titleY = avatarY + avatarSize * 0.7;
  }

  // --- Título ---
  doc.setTextColor(0, 0, 0); // 🔥 <-- esto arregla el color del texto
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Planificación Operativa - ${project.name}`,
    avatarX + avatarSize + 20,
    titleY
  );



  // --- Encabezados ---
  const headers = [
    { content: 'Objetivo', colSpan: 1, styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
    { content: 'Indicador', colSpan: 2, styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
    { content: 'Equipo', colSpan: 2, styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
    { content: 'Recursos', colSpan: 2, styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
    { content: 'Presupuesto', colSpan: 2, styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
    { content: 'Periodo', colSpan: 2, styles: { halign: 'center', fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
  ];

  const subHeaders = [
    { content: '' },
    { content: 'Cantidad' }, { content: 'Concepto' },
    { content: 'Num' }, { content: 'Miembro' },
    { content: 'Num' }, { content: 'Recurso' },
    { content: 'Monto' }, { content: 'Descripción' },
    { content: 'Inicio' }, { content: 'Fin' }
  ];

  // --- Datos ---
  const data = [];
  rows.forEach((row, index) => {
    const maxTeam = row.team.length || 1;
    const maxResources = row.resources.length || 1;
    const maxSubRows = Math.max(maxTeam, maxResources, 1);

    for (let i = 0; i < maxSubRows; i++) {
      data.push([
        i === 0 ? row.objective : '',
        i === 0 ? row.indicator.quantity : '',
        i === 0 ? row.indicator.concept : '',
        row.team[i] ? i + 1 : '',
        row.team[i] || '',
        row.resources[i] ? i + 1 : '',
        row.resources[i] || '',
        i === 0 ? row.budget.amount : '',
        i === 0 ? row.budget.description : '',
        i === 0 ? formatDate(row.period.start) : '',
        i === 0 ? formatDate(row.period.end) : ''
      ]);
    }

    if (index < rows.length - 1) data.push([]);
  });

  // --- Tabla ---
  autoTable(doc, {
    startY: avatarY + avatarSize + 20,
    head: [headers, subHeaders],
    body: data,
    styles: { fontSize: 10, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    theme: 'grid',
    tableWidth: 'auto',
    didDrawPage: (data) => {
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Generado el ${formattedDate}`, 40, pageHeight - 20);
    }
  });

  const safeName = project.name.replace(/[^a-z0-9]/gi, '_');
  doc.save(`plan_operativo_proyecto_${safeName}.pdf`);
};





const OperationalPlanningReadOnlyTable = ({ projectId, project, onProjectWithoutPlan, hasPlan }) => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [gridKey, setGridKey] = useState(0);
  const [hasLoadError, setHasLoadError] = useState(false);
  const notify = useNotification();

  useEffect(() => {
      if (!projectId || !hasPlan) {
          setRows([]);
      }
  }, [projectId, hasPlan]);

  useEffect(() => {
    if (!projectId) {
      setRows([]);
      return;
    }

    const loadRows = async () => {
      setLoadingRows(true);
      try {
        const res = await getOperationalPlanOfProjectApi(projectId);

        if (Array.isArray(res) && res.length === 0) {
          if (onProjectWithoutPlan) onProjectWithoutPlan(projectId);
        }

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
        {(!loadingRows && Array.isArray(rows) && rows.length > 0) && (
          <Box sx={{ display: 'flex', width: '100%', gap: 1, alignItems: 'center', justifyContent: 'flex-end' }}>

            <ExportMenu
              onExportExcel={() => { handleExportExcel(rows, project) }}
              onExportPDF={() => { handleExportPDF(rows, project) }}
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
        <>
          <NoResultsScreen
            message="Este proyecto no tiene un plan operativo. Crea uno desde la vista editable."
            sx={{ height: '50vh' }}
          />
        </>
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
                fontWeight: 'bold',
                fontSize: { xs: '1rem', sm: '1.4rem' }
              },
              '& .MuiDataGrid-cell': {
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderRight: `1px solid ${theme.palette.divider}`,
                padding: '12px',
              },
              '& .MuiDataGrid-cell:last-child': {
                borderRight: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor:
                  theme.palette.mode === 'light'
                    ? 'rgba(0, 0, 0, 0.05)'
                    : 'rgba(255, 255, 255, 0.08)',
                transition: 'background-color 0.2s ease',
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