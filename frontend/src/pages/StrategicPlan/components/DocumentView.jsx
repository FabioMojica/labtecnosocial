import { Box, Typography, Button } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { useRef } from 'react';
import { useTheme } from '@mui/material/styles';

const DocumentView = ({ selectedYear, missionItems, objectiveItems }) => {
  const contentRef = useRef(null);
  const theme = useTheme();

  const exportToPDF = async () => {
    if (!contentRef.current) return;
    
    try {
      // Configuración mejorada para html2canvas
      const canvas = await html2canvas(contentRef.current, {
        scale: 3, // Aumentado para mejor calidad
        logging: false,
        useCORS: true,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[100] : '#ffffff', // ensure light bg for export
        onclone: (document) => {
          // Ajustar estilos para la exportación: forzar texto oscuro y tamaños
          const element = document.querySelector('#exportContent');
          if (element) {
            const textColor = theme.palette.mode === 'dark' ? theme.palette.grey[900] : '#000000';
            const styles = `
              .MuiTypography-root { color: ${textColor} !important; }
              .MuiTypography-h4 { font-size: 24px !important; font-weight: bold !important; }
              .MuiTypography-h5 { font-size: 20px !important; font-weight: bold !important; }
              .MuiTypography-h6 { font-size: 18px !important; font-weight: bold !important; }
              .MuiTypography-subtitle1 { font-size: 16px !important; }
              .MuiTypography-body1, .MuiTypography-body2 { font-size: 14px !important; }
              #exportContent { background: ${theme.palette.mode === 'dark' ? theme.palette.grey[100] : '#ffffff'} !important; }
            `;
            const styleSheet = document.createElement('style');
            styleSheet.innerText = styles;
            document.head.appendChild(styleSheet);
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Agregar márgenes y ajustar el tamaño
      const margin = 10;
      pdf.addImage(imgData, 'PNG', margin, margin, pdfWidth - (margin * 2), pdfHeight - (margin * 2));
      
      pdf.save(`planificacion-estrategica-${selectedYear}.pdf`);
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
    }
  };

  const exportToWord = async () => {
    try {
      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                size: 32,
                bold: true,
                color: "000000"
              },
              paragraph: {
                spacing: { before: 240, after: 120 }
              }
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                size: 28,
                bold: true,
                color: "000000"
              },
              paragraph: {
                spacing: { before: 240, after: 120 }
              }
            },
            {
              id: "Heading3",
              name: "Heading 3",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                size: 24,
                bold: true,
                color: "000000"
              },
              paragraph: {
                spacing: { before: 240, after: 120 }
              }
            }
          ]
        },
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: [
            new Paragraph({
              text: `Planificación Estratégica ${selectedYear}`,
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 400 }
            }),
            new Paragraph({
              text: "Misión",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            new Paragraph({
              text: missionItems[0]?.text || 'No hay misión definida',
              spacing: { before: 200, after: 400 }
            }),
            new Paragraph({
              text: "Objetivos",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 }
            }),
            ...objectiveItems.flatMap((objective, index) => [
              new Paragraph({
                text: `${index + 1}. ${objective.title}`,
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 300, after: 200 }
              }),
              new Paragraph({
                text: "Indicadores:",
                spacing: { before: 200, after: 100 }
              }),
              ...objective.indicators.map(ind => 
                new Paragraph({
                  text: `• ${ind.concept}: ${ind.quantity}`,
                  spacing: { before: 100 }
                })
              ),
              new Paragraph({
                text: "Programas:",
                spacing: { before: 200, after: 100 }
              }),
              ...(objective.programs || []).flatMap((program, progIndex) => [
                new Paragraph({
                  text: `${progIndex + 1}. ${program.text || program.description || program.programDescription}`,
                  spacing: { before: 100, after: 100 }
                }),
                ...(program.projects || []).map((project, projectIndex) => [
                  new Paragraph({
                    text: `Proyecto ${projectIndex + 1}: ${project.title}`,
                    spacing: { before: 100 }
                  }),
                  project.description && new Paragraph({
                    text: project.description,
                    spacing: { before: 100 }
                  }),
                  (project.startDate || project.endDate) && new Paragraph({
                    children: [
                      project.startDate && new TextRun(`Inicio: ${new Date(project.startDate).toLocaleDateString()}`),
                      (project.startDate && project.endDate) && new TextRun(" | "),
                      project.endDate && new TextRun(`Fin: ${new Date(project.endDate).toLocaleDateString()}`)
                    ],
                    spacing: { before: 100, after: 200 }
                  })
                ].filter(Boolean))
              ])
            ])
          ]
        }]
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `planificacion-estrategica-${selectedYear}.docx`);
    } catch (error) {
      console.error('Error al exportar a Word:', error);
    }
  };

  return (
    <Box sx={{ p: 1, width: '100%' }}>
      <Box id="exportContent" ref={contentRef} sx={(theme) => ({ 
        maxWidth: '100%',
        margin: 0,
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[100] : 'white',
        color: theme.palette.mode === 'dark' ? theme.palette.grey[900] : 'inherit',
        p: { xs: 2, sm: 4 },
        borderRadius: 2,
        boxShadow: 1,
        mb: 3,
        width: '100%',
        '& .MuiTypography-h4': { color: theme.palette.mode === 'dark' ? theme.palette.grey[900] : 'inherit' },
        '& .MuiTypography-h5, & .MuiTypography-h6': { color: theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'inherit' },
        '& .MuiTypography-subtitle1, & .MuiTypography-subtitle2, & .MuiTypography-body1, & .MuiTypography-body2': { color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : 'inherit' },
        '& .MuiTypography-caption': { color: theme.palette.mode === 'dark' ? theme.palette.grey[600] : 'inherit' }
      })}>
        {/* Document Title */}
    <Typography variant="h4" sx={{ textAlign: 'center', mb: 4, fontSize: { xs: '1rem', sm: '2rem'} }}>
      Planificación Estratégica {selectedYear}
    </Typography>

    {/* Mission Section */}
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={(theme) => ({ mb: 2, color: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main })}>
        Misión
      </Typography>
      <Typography sx={{ ml: 2 }}>
        {missionItems[0]?.text || 'No hay misión definida'}
      </Typography>
    </Box>

    {/* Objectives Section */}
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={(theme) => ({ mb: 2, color: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main })}>
        Objetivos
      </Typography>
      {objectiveItems.map((objective, index) => (
        <Box key={objective.id} sx={{ mb: 4, ml: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {index + 1}. {objective.title}
          </Typography>

          {/* Indicators */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <Typography variant="subtitle1" sx={(theme) => ({ mb: 1, color: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main })}>
              Indicadores:
            </Typography>
            {objective.indicators.map((ind, indIndex) => (
              <Typography key={ind.id} sx={{ ml: 2 }}>
                • {ind.concept}: {ind.quantity}
              </Typography>
            ))}
          </Box>

          {/* Programs */}
          <Box sx={{ mb: 2, ml: 2 }}>
            <Typography variant="subtitle1" sx={(theme) => ({ mb: 1, color: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main })}>
              Programas:
            </Typography>
            {(objective.programs || []).map((program, progIndex) => (
              <Box key={program.id} sx={{ ml: 2, mb: 2 }}>
                <Typography variant="subtitle2">
                  {progIndex + 1}. {program.text || program.description || program.programDescription}
                </Typography>

                {/* Projects under each program */}
                {program.projects && program.projects.length > 0 && (
                  <Box sx={{ ml: 2, mt: 1 }}>
                    <Typography variant="subtitle1" sx={(theme) => ({ mb: 1, color: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.main })}>
                      Proyectos:
                    </Typography>
                    {program.projects.map((project, projectIndex) => (
                      <Box key={project.id} sx={{ ml: 2, mb: 1 }}>
                        <Typography variant="body2">
                          {projectIndex + 1}. {project.title}
                        </Typography>
                        {project.description && (
                          <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
                            {project.description}
                          </Typography>
                        )}
                        {(project.startDate || project.endDate) && (
                          <Typography variant="caption" sx={{ ml: 2, display: 'block', color: 'text.secondary' }}>
                            {project.startDate && `Inicio: ${new Date(project.startDate).toLocaleDateString()}`}
                            {project.startDate && project.endDate && ' | '}
                            {project.endDate && `Fin: ${new Date(project.endDate).toLocaleDateString()}`}
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
      </Box>

      {/* Action Buttons - Fuera del contenido exportable */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 2, 
        mt: 4,
        position: 'sticky',
        bottom: 20,
        zIndex: 1
      }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={exportToPDF}
          sx={{
            px: 4,
            py: 1.5,
            boxShadow: 2,
            color: theme.palette.getContrastText(theme.palette.primary.main)
          }}
        >
          Exportar PDF
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={exportToWord}
          sx={{
            px: 4,
            py: 1.5,
            boxShadow: 2,
            color: theme.palette.getContrastText(theme.palette.primary.main)
          }}
        >
          Exportar Word
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentView;
