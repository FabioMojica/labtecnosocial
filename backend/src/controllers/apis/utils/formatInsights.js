export function formatInsights(insights) {
  const grouped = {};

  insights.forEach(item => {
    if (grouped[item.name]) {
      grouped[item.name].values = grouped[item.name].values.concat(item.values);
    } else {
      grouped[item.name] = { ...item }; 
    }
  });
  
  return Object.values(grouped);
}