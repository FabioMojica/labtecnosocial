export const isRowEmpty = (row) => {
  return (
    (row.objective?.trim?.() || '') === '' &&
    (row.indicator?.quantity || '') === '' &&
    (row.indicator?.concept || '') === '' &&
    (Array.isArray(row.team) ? row.team.length : 0) === 0 &&
    (Array.isArray(row.resource) ? row.resource.length : 0) === 0 &&
    (row.budget?.amount || '') === '' &&
    (row.budget?.description || '') === '' &&
    (row.period?.start || '') === '' &&
    (row.period?.end || '') === ''
  );
};

export const toNullableNumber = (val) => {
  if (val === "" || val === null || val === undefined) return null;
  return Number(val);
};
