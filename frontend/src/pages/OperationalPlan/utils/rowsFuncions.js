export const toNullableNumber = (val) => {
  if (val === "" || val === null || val === undefined) return null;
  return Number(val);
};

const isEmptyString = (v) =>
  v === null || v === undefined || String(v).trim() === '';

const isEmptyArray = (v) =>
  !Array.isArray(v) || v.length === 0;

export const isRowEmpty = (row) => {
  if (!row) return true;

  return (
    isEmptyString(row.objective) &&
    isEmptyString(row.indicator?.quantity) &&
    isEmptyString(row.indicator?.concept) &&
    isEmptyArray(row.team) &&
    isEmptyArray(row.resource) &&
    isEmptyString(row.budget?.amount) &&
    isEmptyString(row.budget?.description) &&
    isEmptyString(row.period?.start) &&
    isEmptyString(row.period?.end)
  );
};

export const formatRow = (row) => ({
  id: row.id || null,
  objective: row.objective || null,
  indicator_amount: toNullableNumber(row.indicator.quantity),
  indicator_concept: row.indicator.concept ? row.indicator.concept.trim() : null,
  team: Array.isArray(row.team) ? row.team : [],
  resources: Array.isArray(row.resource) ? row.resource : [],
  budget_amount: toNullableNumber(row.budget.amount),
  budget_description: row.budget.description || null,
  period_start: row.period.start || null,
  period_end: row.period.end || null,
});

export const removeRowIfEmpty = (rows, index) => {
  if (rows.length === 1) return rows;

  const updatedRow = rows[index];
  if (isRowEmpty(updatedRow)) {
    return rows.filter((_, i) => i !== index);
  }
  return rows;
};
