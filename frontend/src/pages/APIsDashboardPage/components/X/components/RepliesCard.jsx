import MetricSparkCard from "./MetricSparkCard";

function RepliesCard(props) {
  return (
    <MetricSparkCard
      {...props}
      title={props.title ?? "Respuestas"}
      titleSpinner="Obteniendo respuestas de X..."
      titleError="Ocurrio un error al obtener respuestas de X"
      singular="respuesta"
      plural="respuestas"
      cumulativeLabel="acumuladas"
      gradientId="x-replies-gradient"
      showPlusInTotal={false}
    />
  );
}

export default RepliesCard;
