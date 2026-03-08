import MetricSparkCard from "./MetricSparkCard";

function PageViewsCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Alcance"}
            titleSpinner={"Obteniendo el alcance de Instagram..."}
            titleError={"Ocurrio un error al obtener el alcance de Instagram"}
            singular="persona"
            plural="personas"
            cumulativeLabel="de alcance acumulado"
            gradientId="instagram-reach-gradient"
        />
    );
}

export default PageViewsCard;
