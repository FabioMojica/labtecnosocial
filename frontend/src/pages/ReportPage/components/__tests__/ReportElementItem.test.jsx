import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportElementItem } from "../ReportElementItem";

const stripHtml = (value = "") => value.replace(/<[^>]+>/g, "");

vi.mock("../ChartRenderer", () => ({
  ChartRenderer: () => <div>Chart mock</div>,
}));

vi.mock("../ResizableImage", () => ({
  ResizableImage: () => <div>Image mock</div>,
}));

vi.mock("../../../utils", () => ({
  integrationsConfig: {},
}));

vi.mock("../../utils/chartUtils", () => ({
  parseChartId: () => null,
}));

vi.mock("react-quill-new", () => {
  const MockQuill = React.forwardRef(({ value = "", onChange, readOnly }, ref) => {
    const editor = {
      root: {
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      setContents: () => {},
      clipboard: {
        dangerouslyPasteHTML: () => {},
      },
      getSelection: () => ({ index: 0, length: 0 }),
      deleteText: () => {},
      insertText: () => {},
      setSelection: () => {},
    };

    React.useImperativeHandle(ref, () => ({
      getEditor: () => editor,
    }));

    return (
      <textarea
        aria-label="editor-texto-reporte"
        readOnly={readOnly}
        value={stripHtml(value)}
        onChange={(event) => {
          const nextText = event.target.value;
          onChange?.(
            `<p>${nextText}</p>`,
            null,
            "user",
            {
              getContents: () => ({
                ops: [{ insert: `${nextText}\n` }],
              }),
            }
          );
        }}
      />
    );
  });

  MockQuill.displayName = "MockQuill";

  return {
    default: MockQuill,
    Quill: {},
  };
});

describe("ReportElementItem", () => {
  const buildElement = () => ({
    id: "text-1",
    type: "text",
    content: {
      content_html: "<p>Texto original</p>",
      content_delta: {
        ops: [{ insert: "Texto original\n" }],
      },
    },
  });

  test("restaura visualmente el texto al remontar el editor tras descartar cambios", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const removeElement = vi.fn();
    const element = buildElement();

    const { rerender } = render(
      <ReportElementItem
        key="text-1-0"
        element={element}
        numberOfPreviousSameType={1}
        onChange={onChange}
        removeElement={removeElement}
      />
    );

    const editor = screen.getByLabelText("editor-texto-reporte");
    expect(editor).toHaveValue("Texto original");

    await user.clear(editor);
    await user.type(editor, "Texto editado");
    expect(editor).toHaveValue("Texto editado");

    rerender(
      <ReportElementItem
        key="text-1-1"
        element={element}
        numberOfPreviousSameType={1}
        onChange={onChange}
        removeElement={removeElement}
      />
    );

    expect(screen.getByLabelText("editor-texto-reporte")).toHaveValue("Texto original");
  });
});
