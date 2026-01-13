export const isRowEmpty = (row) => {
  return !row.objective &&
         !row.indicator_amount &&
         !row.indicator_concept &&
         (!row.team || row.team.length === 0) &&
         (!row.resources || row.resources.length === 0) &&
         !row.budget_amount &&
         !row.budget_description &&
         !row.period_start &&
         !row.period_end;
};