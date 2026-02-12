import { parseChartId, chartPropsMap } from "../chartUtils";
import { drawFollowersChart } from "./drawFacebookCharts";


export const drawChartBlock = async ({
  pdfDoc,
  page,
  element,
  x,
  y,
  maxWidth
}) => {

  const integrationPlatform = element?.integration_data?.integration?.platform;
  const parsed = parseChartId(element?.id_name);
  const { chartKey } = parsed;
  const chartConfig = chartPropsMap?.[integrationPlatform]?.[chartKey];

  console.log("------------------------------------------------------>", chartConfig);

  switch (integrationPlatform) {
    case "facebook":
      switch (chartConfig.component) {
        case "followersCard":
          const result = drawFollowersChart({
            pdfDoc,
            page,
            element,
            x,
            y,
            maxWidth,
          });
          return result;
      }
      return;
    default: 
      return { y, page };
  }
  return { y, page };
};
