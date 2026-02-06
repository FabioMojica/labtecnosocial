import { generateUUID } from "../../../utils";

export const formatElementsForDb = (elements, reportTitle) => {
  const normalizedTitle =
    reportTitle?.trim() === "" ? "Reporte sin título": reportTitle.trim();

  const formData = new FormData();

  const data = elements.map((el, index) => {
    const id = generateUUID(el.id);

    const base = {
      id,
      type: el.type,
      position: index,
    };

    switch (el.type) {
      case "text":
        base.content = el.content ?? "";
        break;

      case "image":
        base.alt = el.alt ?? "";
        base.width = Number(el.width ?? 400);
        base.height = Number(el.height ?? 400);
        base.imageKey = el.imageKey ?? id;

        if (el.file instanceof File && el.__local === true) {
          formData.append('file', el.file, id);
        }

        break;
 
      case "chart":
        base.id_name = el.id_name,
        base.title = el.title,
        base.content = el.content;
        base.interval = el.interval;
        base.period = el.period;
        base.data = el?.data;
        base.integration_data = el.integration_data;
        break;

      default:
        base.content = el.content ?? "";
    }

    return base;
  });

  formData.append(
    "report",
    JSON.stringify({
      title: normalizedTitle,
      elements: data,
    })
  );

  return formData;
};

export const formatElementsForFrontend = (report) => {
  if (!report) return { title: "Reporte sin título", elements: [] };

  const title = report.title || "Reporte sin título";

  const elements = (report.data || []).map((el, index) => {
    const uuid = generateUUID(el.id);
    const base = {
      id: uuid,
      type: el.type,
      position: el.position,
    };

    switch (el.type) {
      case 'text':
        return {
          ...base,
          content: el.content || '<p>Nuevo texto...</p>',
        };
      case 'image':
        return {
          ...base,
          src: el.src || el.content || '',
          alt: el.alt || '',
          width: Number(el.width ?? 400),
          height: Number(el.height ?? 400),
          imageKey: el.imageKey,
        };
      case 'chart':
        return {
          ...base,
          id_name: el.id_name,
          title: el.title,
          content: el.content,
          interval: el.interval,
          period: el.period,
          data: el?.data,
          integration_data: el.integration_data
        };
      default:
        return {
          ...base,
          content: el.content || '',
        };
    }
  });

  return { title, elements };
};
