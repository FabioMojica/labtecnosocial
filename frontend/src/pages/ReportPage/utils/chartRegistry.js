import { 
    ChartFollowersByCountry,
    FollowersCard,
    OrganicOrPaidViewsCard,
    TotalActionsCard,
    PageViewsCard,
    PageImpressionsCard,
    TopPostOfThePeriod, 
    PostEngagementsCard,
    TotalReactionsCard,
} from '../../APIsDashboardPage/index.js';

export const chartRegistry = {
  facebook: {
    followersCard: FollowersCard, 
    totalReactionsCard: TotalReactionsCard,
    organicOrPaidViewsCard: OrganicOrPaidViewsCard,
    totalActionsCard: TotalActionsCard,
    pageViewsCard: PageViewsCard,
    pageImpressionsCard: PageImpressionsCard,
    chartFollowersByCountry: ChartFollowersByCountry,
    topPostOfThePeriod: TopPostOfThePeriod,
    postEngagementsCard: PostEngagementsCard 
  },
};

export const getChartComponent = (platform, chartKey) => {
  return chartRegistry[platform]?.[chartKey] || null;
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
