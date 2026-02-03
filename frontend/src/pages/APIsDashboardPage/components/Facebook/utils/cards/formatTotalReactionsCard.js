export const formatForTotalReactionsCard = (insights = []) => {
    if (!insights || !insights.length) return [];

    const totalReactionsMetric = insights.find(i => i.name === "page_actions_post_reactions_total");
    if (!totalReactionsMetric?.values?.length) return [];

    const reactionKeys = ["like", "love", "wow", "haha", "sorry", "anger"];
    const totals = reactionKeys.map(() => 0);

    totalReactionsMetric.values.forEach(val => {
        if (!val.value) return;
        reactionKeys.forEach((key, i) => {
            totals[i] += val.value[key] || 0;
        });
    });

    return totals;
};
