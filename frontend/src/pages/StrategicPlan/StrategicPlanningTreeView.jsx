import React from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import RenderAvatar from '../../generalComponents/RenderAvatar';
import Bullet from './components/Bullet';

const StrategicPlanningTreeView = ({ data, year }) => {
  if (!data) {
    return (
      <Typography sx={{ textAlign: "center" }} variant="body2" color="textSecondary">
        No hay datos de planificación estratégica disponibles.
      </Typography>
    );
  }

  const renderProjects = (projects) =>
    projects.map((project) => (
      <Box
        key={project.id}
        sx={{
          pl: 4,
          py: 0.5,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Typography
          variant="body2"
          sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <Bullet />
          <strong>Proyecto:</strong>
          <RenderAvatar
            image={project.image_url}
            fallbackText={project.name}
            size={32}
            type="project"
          />
          <span>{project.name}</span>
        </Typography>
      </Box>
    ));


  const renderPrograms = (programs) =>
    programs.map((program) => (
      <Box
        key={program.id}
        sx={{
          backgroundColor: '#e3f2fd',
          borderLeft: '4px solid #1976d2',
          borderRadius: 1,
          pl: 2,
          py: 1,
          mt: 2,
        }}
      >
        <Typography variant="body2">
          <Bullet />
          <strong>Programa:</strong> {program.programDescription || program.programDescription}
        </Typography>
        {program.operationalProjects && renderProjects(program.operationalProjects)}
      </Box>
    ));

  const renderObjectives = (objectives) =>
    objectives.map((objective, index) => (
      <Box
        key={objective.id}
        sx={{
          backgroundColor: '#f5f5f5',
          borderLeft: '5px solid #424242',
          borderRadius: 1,
          pl: 2,
          py: 2,
          mt: 3,
        }}
      >
        <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Bullet />
          <strong>{`Objetivo ${index + 1}:`}</strong>&nbsp;
          {objective.objectiveTitle}
        </Typography>


        {objective.indicators?.length > 0 && (
          <Box sx={{ mt: 2, pl: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Indicadores:
            </Typography>
            {objective.indicators.map((ind, index) => (
              <Typography
                key={ind.id}
                variant="body2"
                sx={{ display: 'flex', alignItems: 'start', ml: 2 }}
              >
                <strong>{index + 1}.</strong>&nbsp;
                <strong>Cantidad:</strong>&nbsp;{ind.amount} &nbsp;|&nbsp; <strong>Concepto:</strong>&nbsp;{ind.concept}
              </Typography>
            ))}
          </Box>
        )}
        {objective.programs && renderPrograms(objective.programs)}
      </Box>
    ));

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 3, boxShadow: 4, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
          Planificación Estratégica {year && `(${year})`}
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Misión */}
        {data?.mission && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Misión:
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f0f0f0',
                borderLeft: '4px solid #616161',
                borderRadius: 1,
                px: 2,
                py: 1,
              }}
            >
              <Typography variant="body1">{data.mission}</Typography>
            </Box>
          </Box>
        )}

        {/* Objetivos */}
        {data?.objectives && data.objectives.length > 0 ? (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Objetivos:
            </Typography>
            {renderObjectives(data.objectives)}
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No hay objetivos disponibles.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default StrategicPlanningTreeView;
