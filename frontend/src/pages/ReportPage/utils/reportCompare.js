const IMAGE_SIZE_COMPARE_TOLERANCE_PX = 2;

const normalizeObject = (obj) => {
  if (Array.isArray(obj)) return obj.map(normalizeObject);

  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeObject(obj[key]);
        return acc;
      }, {});
  }

  return obj;
};

const normalizeDelta = (delta) => {
  if (!delta || !delta.ops) return { ops: [] };

  return {
    ops: delta.ops.map(op => normalizeObject(op)),
  };
};

const toFiniteNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeElementForCompare = (element) => {
  const { file, __local, ...rest } = element;

  if (rest.type === "text" && rest.content) {
    return {
      ...rest,
      content: {
        content_delta: normalizeDelta(rest.content.content_delta),
      },
    };
  }

  if (rest.type === "image") {
    return {
      ...rest,
      src: rest.src ?? "",
      alt: rest.alt ?? "",
      width: toFiniteNumber(rest.width, 400),
      height: toFiniteNumber(rest.height, 400),
      imageKey: rest.imageKey ?? rest.id ?? null,
    };
  }

  return normalizeObject(rest);
};

export const normalizeReportForCompare = (report) => ({
  title: report?.title?.trim() || "",
  elementsOrder: Array.isArray(report?.elementsOrder) ? [...report.elementsOrder] : [],
  elements: Object.values(report?.elements || {})
    .map(normalizeElementForCompare)
    .sort((a, b) => a.id.localeCompare(b.id)),
});

const areImageElementsEquivalent = (current, original) => {
  return (
    current.id === original.id &&
    current.type === original.type &&
    current.position === original.position &&
    current.src === original.src &&
    current.alt === original.alt &&
    current.imageKey === original.imageKey &&
    Math.abs(toFiniteNumber(current.width) - toFiniteNumber(original.width)) <= IMAGE_SIZE_COMPARE_TOLERANCE_PX &&
    Math.abs(toFiniteNumber(current.height) - toFiniteNumber(original.height)) <= IMAGE_SIZE_COMPARE_TOLERANCE_PX
  );
};

export const areReportsEquivalent = (currentReport, originalReport) => {
  const current = normalizeReportForCompare(currentReport);
  const original = normalizeReportForCompare(originalReport);

  if (current.title !== original.title) return false;

  if (JSON.stringify(current.elementsOrder) !== JSON.stringify(original.elementsOrder)) {
    return false;
  }

  if (current.elements.length !== original.elements.length) return false;

  for (let index = 0; index < current.elements.length; index += 1) {
    const currentElement = current.elements[index];
    const originalElement = original.elements[index];

    if (!currentElement || !originalElement) return false;

    if (currentElement.type === "image" && originalElement.type === "image") {
      if (!areImageElementsEquivalent(currentElement, originalElement)) {
        return false;
      }

      continue;
    }

    if (JSON.stringify(currentElement) !== JSON.stringify(originalElement)) {
      return false;
    }
  }

  return true;
};

export { IMAGE_SIZE_COMPARE_TOLERANCE_PX };
