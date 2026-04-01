import MetricSparkCard from "./MetricSparkCard";

function TotalLikesCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Vistas"}
            titleSpinner={"Obteniendo vistas de Instagram..."}
            titleError={"Ocurrio un error al obtener vistas de Instagram"}
            singular="vista"
            plural="vistas"
            cumulativeLabel="acumuladas"
            gradientId="instagram-impressions-gradient"
        />
    );
}

export default TotalLikesCard;
