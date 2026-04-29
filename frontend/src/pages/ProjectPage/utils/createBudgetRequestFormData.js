export const createBudgetRequestFormData = ({ objective, items }) => {
  const formData = new FormData();

  formData.append("objective", objective);
  formData.append(
    "items",
    JSON.stringify(
      items.map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
      }))
    )
  );

  items.forEach((item, index) => {
    if (item.support_file instanceof File) {
      formData.append(`file_${index}`, item.support_file);
    }
  });

  return formData;
};
