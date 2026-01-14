import React, { useState } from 'react';
import { Box, Paper, Typography, Divider, Avatar, useTheme } from '@mui/material';
import RenderAvatar from '../../generalComponents/RenderAvatar';
import Bullet from './components/Bullet';
import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExportMenu from './components/ExportMenu';
import { exportStrategicPlanPDF } from './utils/exportStrategicPlanPDF';
import { exportStrategicPlanDOCX } from './utils/exportStrategicPlanDOCX';
import { formatDate } from '../../utils/formatDate';



const API_UPLOADS = import.meta.env.VITE_BASE_URL;


const getRandomSoftColor = (bgColor) => {
  let color;
  do {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 40) + 40;
    const lightness = Math.floor(Math.random() * 30) + 30;
    color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  } while (color === bgColor);
  return color;
};

const StrategicPlanningTreeView = ({ data, year }) => {
  const theme = useTheme();
  const [planVersion, setPlanVersion] = useState(data?.plan_version || 0);

  if (!data) {
    return (
      <Typography sx={{ textAlign: "center" }} variant="body2" color="textSecondary">
        No hay datos de planificación estratégica disponibles.
      </Typography>
    );
  }


  const renderProjects = (projects) => {
    if (!projects || projects.length === 0) return null;
    return (
      <Box
        sx={{
          borderLeft: '4px solid #616161',
          borderRadius: 1,
          pl: 2,
          py: 2,
          mt: 3,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Proyectos:
        </Typography>
        {projects.map((project, index) => (
          <Box
            key={project.id}
            sx={{
              borderLeft: '4px solid #616161',
              borderRadius: 1,
              pl: 2,
              py: 2,
              mt: 1,
            }}
          >

            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bullet />
              <strong>{`Proyecto ${index + 1}:`}</strong>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar
                src={project.image_url ? `${API_UPLOADS}${project.image_url}` : undefined}
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  objectFit: "cover",
                  fontWeight: "bold",
                  boxShadow:
                    theme.palette.mode === 'light'
                      ? '0 0 0 1px rgba(0,0,0,0.3)'
                      : '0 0 0 1px rgba(255,255,255,0.3)',
                }}
              >
                {project.name[0].toUpperCase()}
              </Avatar>

              <Typography variant="h6" textAlign={'justify'}>
                {project.name}
              </Typography>
            </Box>
          </Box>
        ))}</Box>);

  }

  const renderPrograms = (programs) => {
    if (!programs || programs.length === 0) return null;
    return (
      <Box
        sx={{
          borderLeft: `4px solid ${getRandomSoftColor(theme.palette.background.paper)}`,
          borderRadius: 1,
          pl: 2,
          py: 2,
          mt: 3,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Programas:
        </Typography>
        {programs.map((program, index) => (
          <Box
            key={program.id}
            sx={{
              borderLeft: '4px solid #616161',
              borderRadius: 1,
              pl: 2,
              py: 1,
              mt: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bullet />
              <strong>{`Programa ${index + 1}:`}</strong>
            </Typography>
            <Typography variant="body2" textAlign={'justify'}>
              {program.programDescription}
            </Typography>

            {program.operationalProjects &&
              renderProjects(program.operationalProjects)}
          </Box>
        ))}
      </Box>
    );
  };



  const renderObjectives = (objectives) => {
    return (
      <Box
        sx={{
          borderLeft: '4px solid #e77c7cff',
          borderRadius: 1,
          pl: 2,
          py: 2,
          mt: 3,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Objetivos:
        </Typography>
        {objectives.map((objective, index) => (
          <Box
            key={objective.id}
            sx={{
              borderLeft: `4px solid ${getRandomSoftColor(theme.palette.background.paper)}`,
              borderRadius: 1,
              pl: 2,
              py: 2,
              mt: 2,
              mr: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bullet />
              <strong>{`Objetivo ${index + 1}:`}</strong>
            </Typography>
            <Typography textAlign={'justify'}>
              {objective.objectiveTitle}
            </Typography>


            {objective.indicators?.length > 0 && (
              <Box
                sx={{
                  borderLeft: `4px solid ${getRandomSoftColor(theme.palette.background.paper)}`,
                  borderRadius: 1,
                  pl: 2,
                  py: 2,
                  mt: 3,
                }}
              >

                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Indicadores:
                </Typography>
                {objective.indicators.map((ind, index) => (
                  <Box
                    key={ind.id}
                    sx={{
                      borderLeft: `4px solid #616161`,
                      borderRadius: 1,
                      pl: 2,
                      py: 2,
                      mt: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bullet />
                      <strong>{`Indicador ${index + 1}:`}</strong>
                    </Typography>
                    <Box sx={{ mr: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ display: 'flex', alignItems: 'center', ml: 2 }}
                      >
                        <strong>Cantidad:</strong>
                      </Typography>
                      <Typography
                        key={`${ind.id}-amount`}
                        variant="body2"
                        sx={{
                          display: 'flex', alignItems: 'start', ml: 2,
                          wordBreak: 'break-word', // rompe palabras largas si es necesario
                          overflowWrap: 'anywhere', // fuerza a que se rompa en varias líneas
                        }}
                        textAlign={'justify'}
                      >
                        {ind.amount}
                      </Typography>
                      <Typography
                        key={`${ind.id}-concept`}
                        variant="body2"
                        sx={{ display: 'flex', alignItems: 'start', ml: 2 }}
                        textAlign={'justify'}
                      >
                        <strong>Concepto:</strong>&nbsp;
                      </Typography>

                      <Typography
                        key={ind.id}
                        variant="body2"
                        sx={{ display: 'flex', alignItems: 'start', ml: 2 }}
                        textAlign={'justify'}
                      >
                        {ind.concept}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            {objective.programs && renderPrograms(objective.programs)}
          </Box>
        ))}
      </Box>);
  }

  return (
    <Box sx={{
      overflowX: 'auto',
      "&::-webkit-scrollbar": { height: "2px" },
      "&::-webkit-scrollbar-track": { backgroundColor: theme.palette.background.default, borderRadius: "2px" },
      "&::-webkit-scrollbar-thumb": { backgroundColor: theme.palette.primary.main, borderRadius: "2px" },
      "&::-webkit-scrollbar-thumb:hover": { backgroundColor: theme.palette.primary.dark },
      pr: 1,
      pl: {
        xs: 1,
        sm: 0
      },
      maxWidth: '100vw',
    }}>
      <Paper
        sx={{
          boxShadow: 4,
          borderRadius: 3,
          width: '100%',
          display: 'inline-block',
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              fontSize: {
                xs: '1.3rem',
                sm: '1.5rem'
              },
            }}

          >
            Plan Estratégico del año {year && `(${year})`}
          </Typography>

          <ExportMenu
            onExportPDF={() => exportStrategicPlanPDF(data, year)}
            onExportDOCX={() => exportStrategicPlanDOCX(data, year)}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{
          px: {
            xs: 1,
            lg: 3
          }
        }}>
          {/* Misión */}
          {data?.mission && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Misión:
              </Typography>
              <Box
                sx={{
                  borderLeft: '4px solid #1F7D53',
                  borderRadius: 1,
                  px: 2,
                  py: 1,
                }}
              >
                <Typography variant="body1" textAlign={'justify'}>{data.mission}</Typography>
              </Box>
            </Box>
          )}

          {/* Objetivos */}
          {data?.objectives && data.objectives.length > 0 && (
            <>
              {renderObjectives(data.objectives)}
            </>
          )}
        </Box>

        {data?.mission !== '' && (
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
            borderTop: '1px solid',
            borderColor: 'divider',
            px: {lg: 2},
            justifyContent: 'space-between',
            mt: 2
          }}>
            {data?.created_at && data?.updated_at && (
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
                    {formatDate(data?.created_at)}
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
                    {formatDate(data?.updated_at)}
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
                {planVersion}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StrategicPlanningTreeView;
