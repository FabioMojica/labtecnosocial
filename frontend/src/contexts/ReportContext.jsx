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
      // Evitar duplicados por ID
      if (prev.some(c => c.id === chart.id)) return prev;
      return [...prev, chart];
    });
  };

  /**
   * Remueve un chart por ID o por combinación de chartKey + platform + selectedPeriod
   */

  const removeChart = ({ id, chartKey, platform, selectedPeriod }) => {
    setSelectedCharts(prev => {
      if (id) {
        return prev.filter(c => c.id !== id);
      } else if (chartKey && platform && selectedPeriod) {
        const oldId = `${chartKey}-${platform}-${selectedPeriod}`;
        return prev.filter(c => c.id !== oldId);
      }
      return prev;
    });
  };

  const clearCharts = () => setSelectedCharts([]);

  return (
    <ReportContext.Provider value={{ selectedCharts, addChart, removeChart, clearCharts }}>
      {children} 
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);
