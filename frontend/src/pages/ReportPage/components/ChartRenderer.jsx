import React from 'react';
import { getChartComponent, parseChartId } from '../utils/chartRegistry';
import { Typography } from '@mui/material';

export const chartPropsMap = {
  // ======================
  // Facebook – Overview
  // ======================

  followersCard: {
    defaultTitle: 'Seguidores de la página',
    usesInterval: true,
  },

  pageViewsCard: {
    defaultTitle: 'Visitas a la página',
    usesInterval: true,
  },

  pageImpressionsCard: {
    defaultTitle: 'Impresiones de la página',
    usesInterval: true,
  },

  organicOrPaidViewsCard: {
    defaultTitle: 'Impresiones orgánicas vs pagadas',
    usesInterval: true,
  },

  totalActionsCard: {
    defaultTitle: 'Acciones totales',
    usesInterval: true,
  },

  postEngagementsCard: {
    defaultTitle: 'Interacciones con publicaciones',
    usesInterval: true,
  },

  totalReactionsCard: {
    defaultTitle: 'Reacciones totales',
    usesInterval: true,
  },

  // ======================
  // Facebook – Detalle
  // ======================

  chartFollowersByCountry: {
    defaultTitle: 'Seguidores por país',
    usesInterval: true,
  },

  topPostOfThePeriod: {
    defaultTitle: 'Top 5 posts populares',
    usesInterval: true,
  },
};

export const ChartRenderer = ({ element }) => {
  const { id, id_name, data, content, title, integration_data, interval, period, type, ...rest } = element
 

  const parsed = parseChartId(id_name);

  if (!parsed) {
    return (
      <Typography variant="body2" color="text.secondary">
        Gráfica desconocida: {id}
      </Typography>
    );
  }

  const { chartKey } = parsed;

  const ChartComponent = getChartComponent(integration_data?.integration?.platform, chartKey);

  if (!ChartComponent) { 
    return (
      <Typography variant="body2" color="text.secondary">
        Componente no encontrado: {integration_data?.integration?.platform}/{chartKey}
      </Typography>
    );
  }

  const chartConfig = chartPropsMap[chartKey];
 
  if (!chartConfig) {
    return (
      <Typography variant="body2" color="text.secondary">
        Configuración no encontrada: {chartKey}
      </Typography>
    );
  }

  const {
    defaultTitle,
  } = chartConfig;

  const baseProps = {
    ...rest,
    integration_data: integration_data,
    loading: false,
    error: false,
    title: title || content || defaultTitle,
    interval: interval || 'Unknow period',
    period: period || 'Periodo desconodido',
    selected: false,
    selectable: false,
    onSelectChange: () => {},
    data: data
  };

  const finalProps = {
    ...baseProps,
  };

  return <ChartComponent {...finalProps} />;
};
