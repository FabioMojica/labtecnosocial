import { formatForOrganicOrPaidViewsCard } from "../Facebook/utils/cards/formatForOrganicOrPaidViewsCard";
import { formatForPageImpressionsCard } from "../Facebook/utils/cards/formatForPageImpressionsCard";
import { formatForTotalActionsCard } from "../Facebook/utils/cards/formatForTotalActionsCard";
import {
  formatInstagramEngagementRateCard,
  formatInstagramInteractionBreakdownCard,
  formatInstagramMetricCard,
  formatInstagramProfileConversionFunnelCard,
} from "../Instagram/utils/cards/formatters";
import { buildRowsFromCommits } from "../GitHub/utils/dataGridAdapter";

const isoAtMidday = (offsetDays = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString();
};

const localIsoDate = (offsetDays = 0) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

describe("KPI dashboard formatters", () => {
  test("Facebook - formatForOrganicOrPaidViewsCard separa organicas y pagadas", () => {
    const result = formatForOrganicOrPaidViewsCard([
      { is_from_ads: 0, value: 10 },
      { is_from_ads: "0", value: 5 },
      { is_from_ads: 1, value: 3 },
    ]);

    expect(result.total).toBe(18);
    expect(result.organic).toBe(15);
    expect(result.paid).toBe(3);
    expect(result.chartData).toHaveLength(2);
  });

  test("Facebook - formatForPageImpressionsCard agrupa por dia y suma valores", () => {
    const result = formatForPageImpressionsCard([
      { end_time: "2026-04-19T07:00:00+0000", value: 5 },
      { end_time: "2026-04-19T12:00:00+0000", value: 3 },
      { end_time: "2026-04-20T07:00:00+0000", value: 10 },
    ]);

    expect(result.chartData).toEqual([8, 10]);
    expect(result.total).toBe(18);
    expect(result.delta).toBe(2);
  });

  test("Facebook - formatForTotalActionsCard soporta value numerico y objeto", () => {
    const result = formatForTotalActionsCard([
      { end_time: "2026-04-19T07:00:00+0000", value: 4 },
      { end_time: "2026-04-20T07:00:00+0000", value: { click: 3, tap: 2 } },
    ]);

    expect(result.chartData).toEqual([4, 5]);
    expect(result.total).toBe(9);
    expect(result.latestValue).toBe(5);
    expect(result.delta).toBe(1);
  });

  test("Instagram - formatInstagramMetricCard usa fallback total_value", () => {
    const insights = [
      {
        name: "profile_views",
        total_value: { value: 22, end_time: localIsoDate(-1) },
      },
    ];

    const result = formatInstagramMetricCard(insights, "profile_views", "lastMonth");

    expect(result.total).toBe(22);
    expect(result.chartData.length).toBe(30);
    expect(result.chartData.some((value) => value === 22)).toBe(true);
  });

  test("Instagram - formatInstagramEngagementRateCard calcula tasa", () => {
    const insights = [
      { name: "reach", values: [{ value: 100, end_time: isoAtMidday(-1) }] },
      { name: "total_interactions", values: [{ value: 25, end_time: isoAtMidday(-1) }] },
    ];

    const result = formatInstagramEngagementRateCard(insights, "lastMonth");
    expect(result.total).toBe(25);
    expect(result.interactionsTotal).toBe(25);
    expect(result.reachTotal).toBe(100);
    expect(result.hasData).toBe(true);
  });

  test("Instagram - formatInstagramInteractionBreakdownCard evita negativos", () => {
    const insights = [
      { name: "likes", total_value: { value: -5, end_time: localIsoDate(-1) } },
      { name: "comments", total_value: { value: 3, end_time: localIsoDate(-1) } },
      { name: "shares", total_value: { value: 2, end_time: localIsoDate(-1) } },
    ];

    const result = formatInstagramInteractionBreakdownCard(insights, "lastMonth");
    const likes = result.chartData.find((item) => item.key === "likes");
    const comments = result.chartData.find((item) => item.key === "comments");

    expect(likes.value).toBe(0);
    expect(comments.value).toBe(3);
    expect(result.total).toBe(5);
  });

  test("Instagram - formatInstagramProfileConversionFunnelCard arma embudo y conversiones", () => {
    const insights = [
      { name: "profile_views", total_value: { value: 100, end_time: localIsoDate(-1) } },
      { name: "profile_links_taps", total_value: { value: 40, end_time: localIsoDate(-1) } },
      { name: "website_clicks", total_value: { value: 10, end_time: localIsoDate(-1) } },
    ];

    const result = formatInstagramProfileConversionFunnelCard(insights, "lastMonth");
    expect(result.total).toBe(10);
    expect(result.profileViewsTotal).toBe(100);
    expect(result.conversionRates.tapsVsViews).toBe(40);
    expect(result.conversionRates.clicksVsTaps).toBe(25);
    expect(result.pieData.reduce((acc, row) => acc + row.value, 0)).toBe(100);
  });

  test("GitHub - buildRowsFromCommits agrupa por autor y ordena por commits", () => {
    const commits = [
      {
        author: { login: "ana", avatar_url: "https://img/ana.png" },
        commit: { author: { email: "ana@test.com", date: "2026-04-20T10:00:00Z" } },
      },
      {
        author: { login: "ana", avatar_url: "https://img/ana.png" },
        commit: { author: { email: "ana@test.com", date: "2026-04-20T11:00:00Z" } },
      },
      {
        author: { login: "luis", avatar_url: "https://img/luis.png" },
        commit: { author: { email: "luis@test.com", date: "2026-04-19T09:00:00Z" } },
      },
    ];

    const rows = buildRowsFromCommits(commits);
    expect(rows).toHaveLength(2);
    expect(rows[0].login).toBe("ana");
    expect(rows[0].totalCommits).toBe(2);
    expect(rows[0].position).toBe(1);
    expect(rows[1].login).toBe("luis");
    expect(rows[1].totalCommits).toBe(1);
  });
});
