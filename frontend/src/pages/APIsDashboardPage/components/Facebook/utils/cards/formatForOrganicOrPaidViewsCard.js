export const formatForOrganicOrPaidViewsCard = (values) => {
  if (!values || values.length === 0) return { total: 0, organic: 0, paid: 0, chartData: [] };

  const organic = values
    .filter(v => String(v.is_from_ads) === "0")
    .reduce((acc, v) => acc + v.value, 0);

  const paid = values
    .filter(v => String(v.is_from_ads) === "1")
    .reduce((acc, v) => acc + v.value, 0);

  const total = organic + paid;

  return {
    total,
    organic,
    paid,
    chartData: [
      { name: "Orgánicas", value: organic },
      { name: "Pagadas", value: paid }
    ]
  };
};
