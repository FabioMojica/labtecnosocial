export function formatForPostEngagementCard(values) {
    if (!values || values.length === 0) return { total: 0, delta: 0 };

    const total = values.reduce((acc, v) => acc + (v.value || 0), 0);
    const lastIndex = values.length - 1;
    const delta = lastIndex > 0 
        ? (values[lastIndex].value || 0) - (values[lastIndex - 1].value || 0)
        : 0;

    return { total, delta };
}
