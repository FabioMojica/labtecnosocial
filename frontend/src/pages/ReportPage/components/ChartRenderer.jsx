import React from 'react';
import { getChartComponent, parseChartId } from '../utils/chartRegistry';
import { Typography } from '@mui/material';

export const chartPropsMap = {
  // ======================
  // Facebook – Overview
  // ======================

  followersCard: {
    dataProp: 'followersData',
    defaultTitle: 'Seguidores de la página',
    usesInterval: true,
  },

  pageViewsCard: {
    dataProp: 'viewsPageData',
    defaultTitle: 'Visitas a la página',
    usesInterval: true,
  },

  pageImpressionsCard: {
    dataProp: 'impressionsPageData',
    defaultTitle: 'Impresiones de la página',
    usesInterval: true,
  },

  organicOrPaidViewsCard: {
    dataProp: 'organicOrPaidViewsData',
    defaultTitle: 'Impresiones orgánicas vs pagadas',
    usesInterval: true,
  },

  totalActionsCard: {
    dataProp: 'totalActionsData',
    defaultTitle: 'Acciones totales',
    usesInterval: true,
  },

  postEngagementsCard: {
    dataProp: 'postEngagementsData',
    defaultTitle: 'Interacciones con publicaciones',
    usesInterval: true,
  },

  totalReactionsCard: {
    dataProp: 'totalReactionsOfPage',
    defaultTitle: 'Reacciones totales',
    usesInterval: true,
  },

  // ======================
  // Facebook – Detalle
  // ======================

  chartFollowersByCountry: {
    dataProp: 'countryFollowersData',
    defaultTitle: 'Seguidores por país',
  },

  topPostOfThePeriod: {
    dataProp: 'topPostsData',
    defaultTitle: 'Top 5 posts populares',
  },
};


const ChartRenderer = ({ element }) => {
  const { id, data, content, platform, interval, selectedPeriod, type, ...rest } = element

  const parsed = parseChartId(id);

  if (!parsed) {
    return (
      <Typography variant="body2" color="text.secondary">
        Gráfica desconocida: {id}
      </Typography>
    );
  }

  const { chartKey } = parsed;

  const ChartComponent = getChartComponent(platform, chartKey);

  if (!ChartComponent) {
    return (
      <Typography variant="body2" color="text.secondary">
        Componente no encontrado: {platform}/{chartKey}
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
    dataProp,
    defaultTitle,
    usesInterval,
    usesPeriodAsProp,
  } = chartConfig;

  const baseProps = {
    ...rest,
    selectable: false,
    error: false,
    loading: false,
    title: content || defaultTitle,
  };

  const finalProps = {
    ...baseProps,
    [dataProp]: data,
    ...(usesInterval && { interval: interval || 'Periodo' }),
    ...(usesPeriodAsProp && { selectedPeriod: period || 'all' }),
    ...(usesInterval && {
      selected: false,
      onSelectChange: () => {},
    }),
  };

  return <ChartComponent {...finalProps} />;
};

export default ChartRenderer;
