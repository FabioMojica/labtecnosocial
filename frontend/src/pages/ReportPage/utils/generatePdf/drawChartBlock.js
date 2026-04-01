import { parseChartId, chartPropsMap } from "../chartUtils";
import { drawFacebookChart } from "./drawFacebookCharts";
import { drawGithubChart } from "./drawGithubCharts";

const normalizeXElementForPdf = (element, component) => {
  const data = element?.data;
  if (component === "organicOrPaidViewsCard" && data && !Array.isArray(data)) {
    const likes = Number(data?.likesTotal ?? 0);
    const reposts = Number(data?.repostsTotal ?? 0);
    const replies = Number(data?.repliesTotal ?? 0);
    const quotes = Number(data?.quotesTotal ?? 0);
    const chartData = [
      { name: "Likes", value: likes },
      { name: "Reposts", value: reposts },
      { name: "Respuestas", value: replies },
      { name: "Citas", value: quotes },
    ];

    return {
      ...element,
      data: {
        total: likes + reposts + replies + quotes,
        chartData,
      },
    };
  }

  if (component === "totalReactionsCard" && data && !Array.isArray(data)) {
    const likes = Number(data?.likesTotal ?? 0);
    const reposts = Number(data?.repostsTotal ?? 0);
    const replies = Number(data?.repliesTotal ?? 0);
    const quotes = Number(data?.quotesTotal ?? 0);
    return {
      ...element,
      data: [likes, reposts, replies, quotes, 0, 0],
    };
  }

  if (Array.isArray(data) || !data) {
    return element;
  }
  return element;
};

const normalizeInstagramElementForPdf = (element, chartKey, component) => {
  const data = element?.data;
  if (!data || Array.isArray(data)) return element;

  if (chartKey === "profileConversionFunnelCard" && component === "organicOrPaidViewsCard") {
    const pieData = Array.isArray(data?.pieData) ? data.pieData : [];
    const total = Number(data?.profileViewsTotal ?? 0);
    return {
      ...element,
      data: {
        chartData: pieData.map((item) => ({
          name: item?.name ?? "Segmento",
          value: Number(item?.value ?? 0),
        })),
        total,
      },
    };
  }

  return element;
};

export const drawChartBlock = async ({
  pdfDoc,
  page,
  element,
  x,
  y,
  maxWidth,
}) => {
  const platform = element?.integration_data?.integration?.platform;
  const parsed = parseChartId(element?.id_name);
  const chartKey = parsed?.chartKey;
  const chartConfig = chartPropsMap?.[platform]?.[chartKey];

  if (!platform || !chartKey || !chartConfig) {
    return { y, page };
  }

  switch (platform) {
    case "facebook":
      return drawFacebookChart({
        pdfDoc,
        page,
        element,
        component: chartConfig.component,
        x,
        y,
        maxWidth,
      });
    case "instagram":
      return drawFacebookChart({
        pdfDoc,
        page,
        element: normalizeInstagramElementForPdf(element, chartKey, chartConfig.component),
        component: chartConfig.component,
        x,
        y,
        maxWidth,
      });
    case "github":
      return drawGithubChart({
        pdfDoc,
        page,
        element,
        component: chartConfig.component,
        x,
        y,
        maxWidth,
      });
    case "x":
      return drawFacebookChart({
        pdfDoc,
        page,
        element: normalizeXElementForPdf(element, chartConfig.component),
        component: chartConfig.component,
        x,
        y,
        maxWidth,
      });
    default:
      return { y, page };
  }
};
