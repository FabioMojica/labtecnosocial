import MetricSparkCard from "./MetricSparkCard";

function BookmarksCard(props) {
  return (
    <MetricSparkCard
      {...props}
      title={props.title ?? "Guardados"}
      titleSpinner="Obteniendo guardados de X..."
      titleError="Ocurrio un error al obtener guardados de X"
      singular="guardado"
      plural="guardados"
      cumulativeLabel="acumulados"
      gradientId="x-bookmarks-gradient"
      showPlusInTotal={false}
    />
  );
}

export default BookmarksCard;
