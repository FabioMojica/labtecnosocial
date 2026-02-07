import { generateUUID } from "../../../utils";

export const getElementLabel = (type) => {
    switch (type) {
      case 'text':
        return 'Texto';
      case 'chart':
        return 'Gráfico';
      case 'image':
        return 'Imagen';
      default:
        return 'Elemento';
    }
  };

export const formatElementsForFrontend = (backendReport) => {
  if (!backendReport) {
    return {
      title: "Reporte sin título",
      elements: {},
      elementsOrder: [],
    };
  }

  const title = backendReport.title ?? "Reporte sin título";

  const data = backendReport.data ?? {};
  const backendElements = data.elements ?? {};
  const backendOrder = data.elementsOrder ?? [];

  const elements = {};
  const elementsOrder = [];

  backendOrder.forEach((id) => {
    const el = backendElements[id];
    if (!el) return;

    const base = {
      id: el.id,
      type: el.type,
      position: el.position ?? 0,
    };


    switch (el.type) {
      case "text":
        elements[id] = {
          ...base,
          content: { 
            content_html: el.content.content_html ?? "<p>Nuevo texto...</p>",
            content_delta: el.content.content_delta
          },
        };

        break;

      case "image":
        elements[id] = {
          ...base,
          src: el.src || "",
          alt: el.alt || "",
          width: Number(el.width ?? 400),
          height: Number(el.height ?? 400),
          imageKey: el.imageKey ?? id,
        };
        break;

      case "chart":
        elements[id] = {
          ...base,
          id_name: el.id_name,
          title: el.title,
          content: el.content,
          interval: el.interval,
          period: el.period,
          data: el.data,
          integration_data: el.integration_data,
        };
        break;

      default:
        elements[id] = {
          ...base,
          content: el.content || "",
        };
    }

    elementsOrder.push(id);
  });

  return { title, elements, elementsOrder };
};


export const formatElementsForDb = (editedReport) => {
  const { title, elements, elementsOrder } = editedReport;

  const normalizedTitle =
    !title?.trim() ? "Reporte sin título" : title.trim();

  const formData = new FormData();

  const data = elementsOrder.map((uuid, index) => {
    const el = elements[uuid];

    const base = {
      id: generateUUID(el.id),
      type: el.type,
      position: index,
    };

    switch (el.type) {
      case "text":
        base.content =  { 
          content_html: el?.content?.content_html ?? "<p>Nuevo texto...</p>",
          content_delta: el?.content?.content_delta
        }

        break;

      case "image":
        base.src = el.src ?? "";
        base.alt = el.alt ?? "";
        base.width = Number(el.width ?? 400);
        base.height = Number(el.height ?? 400);
        base.imageKey = el.imageKey ?? el.id;

        if (el.file instanceof File && el.__local === true) {
          formData.append("file", el.file, el.id);
        }

        break;

      case "chart":
        base.id_name = el.id_name ?? "";
        base.title = el.title ?? "";
        base.content = el.content ?? "";
        base.interval = el.interval ?? "";
        base.period = el.period ?? "";
        base.data = el.data ?? [];
        base.integration_data = el.integration_data ?? {};
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
      elements: Object.fromEntries(
        data.map(el => [el.id, el])
      ),
      elementsOrder: elementsOrder,
    })
  );

  return formData;
};
