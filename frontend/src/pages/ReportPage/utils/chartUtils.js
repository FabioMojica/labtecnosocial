
export const chartPropsMap = {
    facebook: {
        followersCard: {
            component: 'followersCard',
            defaultTitle: 'Nuevos seguidores de la página',
            usesInterval: true,
        },

        pageViewsCard: {
            component: 'pageViewsCard',
            defaultTitle: 'Visitas a la página',
            usesInterval: true,
        },

        pageImpressionsCard: {
            component: 'pageImpressionsCard',
            defaultTitle: 'Impresiones de la página',
            usesInterval: true,
        },

        organicOrPaidViewsCard: {
            component: 'organicOrPaidViewsCard',
            defaultTitle: 'Impresiones orgánicas vs pagadas',
            usesInterval: true,
        },

        totalActionsCard: {
            component: 'totalActionsCard',
            defaultTitle: 'Acciones totales',
            usesInterval: true,
        },

        postEngagementsCard: {
            component: 'postEngagementsCard',
            defaultTitle: 'Interacciones con publicaciones',
            usesInterval: true,
        },

        totalReactionsCard: {
            component: 'totalReactionsCard',
            defaultTitle: 'Reacciones totales',
            usesInterval: true,
        },

        chartFollowersByCountry: {
            component: 'chartFollowersByCountry',
            defaultTitle: 'Seguidores por país',
            usesInterval: true,
        },

        topPostOfThePeriod: {
            component: 'topPostOfThePeriod',
            defaultTitle: 'Top 5 posts populares',
            usesInterval: true,
        },
    }
};

export const parseChartId = (chartId) => {
  if (!chartId) return null;
 
  const cleanId = chartId.replace('chart-', '');
  const parts = cleanId.split('-');

  if (parts.length < 2) return null;

  const chartKey = parts[0];

  // 🔥 NORMALIZACIÓN DEL PLATFORM
  let rawPlatform = parts[1];
  let platform = rawPlatform.includes(':')
    ? rawPlatform.split(':')[1]
    : rawPlatform;

  const period = parts[2] || null;

  return {
    chartKey,
    platform,
    period,
    fullId: chartId,
    rawPlatform,
  };
};
