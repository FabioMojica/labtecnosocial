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
} from "../../APIsDashboardPage/index.js";
import InstagramFollowersCard from "../../APIsDashboardPage/components/Instagram/components/FollowersCard";
import InstagramReachCard from "../../APIsDashboardPage/components/Instagram/components/PageViewsCard";
import InstagramImpressionsCard from "../../APIsDashboardPage/components/Instagram/components/TotalLikesCard";
import InstagramInteractionsCard from "../../APIsDashboardPage/components/Instagram/components/TotalReactionsCard";
import InstagramPostsCard from "../../APIsDashboardPage/components/Instagram/components/PostsCard";
import InstagramProfileViewsCard from "../../APIsDashboardPage/components/Instagram/components/ProfileViewsCard";
import InstagramEngagedAccountsCard from "../../APIsDashboardPage/components/Instagram/components/EngagedAccountsCard";
import InstagramEngagementRateCard from "../../APIsDashboardPage/components/Instagram/components/EngagementRateCard";
import InstagramAvgInteractionsPerPostCard from "../../APIsDashboardPage/components/Instagram/components/AvgInteractionsPerPostCard";
import InstagramContentTypePerformanceCard from "../../APIsDashboardPage/components/Instagram/components/ContentTypePerformanceCard";

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
  instagram: {
    followersCard: InstagramFollowersCard,
    pageViewsCard: InstagramReachCard,
    pageImpressionsCard: InstagramImpressionsCard,
    profileViewsCard: InstagramProfileViewsCard,
    engagedAccountsCard: InstagramEngagedAccountsCard,
    interactionsCard: InstagramInteractionsCard,
    postingFrequencyCard: InstagramPostsCard,
    engagementRateCard: InstagramEngagementRateCard,
    avgInteractionsPerPostCard: InstagramAvgInteractionsPerPostCard,
    contentTypePerformanceCard: InstagramContentTypePerformanceCard,
    topPostOfThePeriod: TopPostOfThePeriod,
  },
};

export const getChartComponent = (platform, chartKey) => {
  return chartRegistry[platform]?.[chartKey] || null;
};
