import { renderHook, act } from "@testing-library/react";
import { ReportProvider, useReport } from "../ReportContext";

const wrapper = ({ children }) => <ReportProvider>{children}</ReportProvider>;

describe("ReportContext", () => {
  test("addChart agrega y reemplaza por id_name para evitar duplicados", () => {
    const { result } = renderHook(() => useReport(), { wrapper });

    act(() => {
      result.current.addChart({
        id_name: "facebook/pageImpressions",
        platform: "facebook",
        title: "Impresiones",
      });
    });

    expect(result.current.selectedCharts).toHaveLength(1);
    expect(result.current.selectedCharts[0].title).toBe("Impresiones");

    act(() => {
      result.current.addChart({
        id_name: "facebook/pageImpressions",
        platform: "facebook",
        title: "Impresiones actualizadas",
        interval: "Último mes",
      });
    });

    expect(result.current.selectedCharts).toHaveLength(1);
    expect(result.current.selectedCharts[0].title).toBe("Impresiones actualizadas");
    expect(result.current.selectedCharts[0].interval).toBe("Último mes");
  });

  test("removeChart y clearCharts eliminan selección correctamente", () => {
    const { result } = renderHook(() => useReport(), { wrapper });

    act(() => {
      result.current.addChart({ id_name: "github/totalCommits", platform: "github" });
      result.current.addChart({ id_name: "instagram/reach", platform: "instagram" });
    });

    expect(result.current.selectedCharts).toHaveLength(2);

    act(() => {
      result.current.removeChart({ id_name: "github/totalCommits" });
    });

    expect(result.current.selectedCharts).toHaveLength(1);
    expect(result.current.selectedCharts[0].id_name).toBe("instagram/reach");

    act(() => {
      result.current.clearCharts();
    });

    expect(result.current.selectedCharts).toHaveLength(0);
  });
});

