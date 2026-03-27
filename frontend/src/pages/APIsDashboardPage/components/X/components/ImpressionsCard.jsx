import MetricSparkCard from "./MetricSparkCard";

function ImpressionsCard(props) {
  return (
    <MetricSparkCard
      {...props}
      title={props.title ?? "Impresiones"}
      titleSpinner="Obteniendo impresiones de X..."
      titleError="Ocurrio un error al obtener impresiones de X"
      singular="impresion"
      plural="impresiones"
      cumulativeLabel="acumuladas"
      gradientId="x-impressions-gradient"
      showPlusInTotal={false}
    />
  );
}

export default ImpressionsCard;
