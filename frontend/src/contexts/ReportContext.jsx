import { createContext, useContext, useState } from 'react';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [selectedCharts, setSelectedCharts] = useState([]);

  const addChart = (chart) => {
    setSelectedCharts((prev) => [...prev, chart]);
  };

  const removeChart = (chartId) => {
    setSelectedCharts((prev) => prev.filter(c => c.id !== chartId));
  };

  const clearCharts = () => setSelectedCharts([]);

  return (
    <ReportContext.Provider value={{ selectedCharts, addChart, removeChart, clearCharts }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);
