import { getChartComponent } from '../utils/chartRegistry';
import { Typography } from '@mui/material';
import { chartPropsMap, parseChartId } from '../utils/chartUtils';

export const ChartRenderer = ({ element }) => {
  const { id, id_name, data, content, title, integration_data, interval, period, type, ...rest } = element
 

  const parsed = parseChartId(id_name);

  if (!parsed) {
    return (
      <Typography variant="body2" color="text.secondary">
        Gráfica desconocida: {id}
      </Typography>
    );
  }

  const { chartKey } = parsed;

  const ChartComponent = getChartComponent(integration_data?.integration?.platform, chartKey);

  if (!ChartComponent) { 
    return (
      <Typography variant="body2" color="text.secondary">
        Componente no encontrado: {integration_data?.integration?.platform}/{chartKey}
      </Typography>
    );
  }

  const platform = integration_data?.integration?.platform;
  const chartConfig = chartPropsMap?.[platform]?.[chartKey];
 
  if (!chartConfig) {
    return (
      <Typography variant="body2" color="text.secondary">
        Configuración no encontrada: {chartKey}
      </Typography>
    );
  }

  const {
    defaultTitle,
  } = chartConfig;

  const baseProps = {
    ...rest,
    mode: 'report',
    integration_data: integration_data,
    loading: false,
    error: false,
    title: title || content || defaultTitle,
    interval: interval || 'Unknow period',
    period: period || 'Periodo desconodido',
    selected: false,
    selectable: false,
    onSelectChange: () => {},
    data: data
  };

  const finalProps = {
    ...baseProps,
  };

  return <ChartComponent {...finalProps} />;
};
