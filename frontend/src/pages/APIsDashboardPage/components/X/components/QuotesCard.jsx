import MetricSparkCard from "./MetricSparkCard";

function QuotesCard(props) {
  return (
    <MetricSparkCard
      {...props}
      title={props.title ?? "Citas"}
      titleSpinner="Obteniendo citas de X..."
      titleError="Ocurrio un error al obtener citas de X"
      singular="cita"
      plural="citas"
      cumulativeLabel="acumuladas"
      gradientId="x-quotes-gradient"
      showPlusInTotal={false}
    />
  );
}

export default QuotesCard;
