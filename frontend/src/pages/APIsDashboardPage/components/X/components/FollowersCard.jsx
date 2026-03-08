import MetricSparkCard from "./MetricSparkCard";

function FollowersCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Publicaciones"}
            titleSpinner={"Obteniendo publicaciones de X..."}
            titleError={"Ocurrio un error al obtener publicaciones de X"}
            singular="tweet"
            plural="tweets"
            cumulativeLabel="acumulados"
            gradientId="x-posts-gradient"
            showPlusInTotal={false}
        />
    );
}

export default FollowersCard;
