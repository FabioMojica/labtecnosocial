import MetricSparkCard from "./MetricSparkCard";

function FollowersCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Seguidores"}
            titleSpinner={"Obteniendo los seguidores de Instagram..."}
            titleError={"Ocurrio un error al obtener los seguidores de Instagram"}
            singular="seguidor"
            plural="seguidores"
            cumulativeLabel="acumulados"
            gradientId="instagram-followers-gradient"
        />
    );
}

export default FollowersCard;
