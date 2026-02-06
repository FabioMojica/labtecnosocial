import { createContext, useContext, useState } from 'react';

const ReportContext = createContext();

export const ReportProvider = ({ children }) => {
  const [selectedCharts, setSelectedCharts] = useState([]);

  /**
   * Agrega un chart al reporte.
   * @param {Object} options
   * @param {string} options.chartKey - Nombre interno del chart, ej: 'followersCard'
   * @param {string} options.platform - 'facebook', 'github', 'twitter', etc.
   * @param {string} options.selectedPeriod - 'today', 'lastMonth', etc.
   * @param {string} options.title - Título del chart
   * @param {any} options.data - Datos del chart
   * @param {string} options.interval - Label legible para mostrar, ej: 'Último mes'
   */
  const addChart = (chart) => {
    setSelectedCharts(prev => {
      const id = crypto.randomUUID();
      if (prev.some(c => c.id === id)) return prev;
      return [...prev, { ...chart, id }];
    });
  };

  /**
   * Remueve un chart por ID o por combinación de chartKey + platform + selectedPeriod
   */

  const removeChart = ({ id_name }) => {
    setSelectedCharts(prev => prev.filter(c => c.id_name !== id_name));
  };

  const clearCharts = () => setSelectedCharts([]);

  return (
    <ReportContext.Provider value={{ selectedCharts, addChart, removeChart, clearCharts }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);
