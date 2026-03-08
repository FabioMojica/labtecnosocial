import MetricSparkCard from "./MetricSparkCard";

function TotalLikesCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Impresiones"}
            titleSpinner={"Obteniendo impresiones de Instagram..."}
            titleError={"Ocurrio un error al obtener impresiones de Instagram"}
            singular="impresion"
            plural="impresiones"
            cumulativeLabel="acumuladas"
            gradientId="instagram-impressions-gradient"
        />
    );
}

export default TotalLikesCard;
