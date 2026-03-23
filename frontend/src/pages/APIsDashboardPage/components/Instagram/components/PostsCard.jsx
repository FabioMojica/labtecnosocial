import MetricSparkCard from "./MetricSparkCard";

function PostsCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Publicaciones"}
            titleSpinner={"Obteniendo publicaciones de Instagram..."}
            titleError={"Ocurrio un error al obtener publicaciones de Instagram"}
            singular="publicacion"
            plural="publicaciones"
            cumulativeLabel="publicaciones acumuladas"
            gradientId="instagram-posts-gradient"
        />
    );
}

export default PostsCard;
