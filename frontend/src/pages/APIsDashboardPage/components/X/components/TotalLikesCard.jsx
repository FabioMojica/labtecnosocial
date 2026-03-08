import MetricSparkCard from "./MetricSparkCard";

function TotalLikesCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Reposts"}
            titleSpinner={"Obteniendo reposts de X..."}
            titleError={"Ocurrio un error al obtener reposts de X"}
            singular="repost"
            plural="reposts"
            cumulativeLabel="acumulados"
            gradientId="x-reposts-gradient"
            showPlusInTotal={false}
        />
    );
}

export default TotalLikesCard;
