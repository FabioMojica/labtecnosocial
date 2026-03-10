import { parseChartId, chartPropsMap } from "../chartUtils";
import { drawFacebookChart } from "./drawFacebookCharts";

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
    default:
      return { y, page };
  }
};
