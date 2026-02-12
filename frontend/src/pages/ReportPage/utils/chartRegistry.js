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
