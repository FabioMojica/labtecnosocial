import MetricSparkCard from "./MetricSparkCard";

function PageViewsCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Likes"}
            titleSpinner={"Obteniendo likes de X..."}
            titleError={"Ocurrio un error al obtener likes de X"}
            singular="like"
            plural="likes"
            cumulativeLabel="acumulados"
            gradientId="x-likes-gradient"
            showPlusInTotal={false}
        />
    );
}

export default PageViewsCard;
