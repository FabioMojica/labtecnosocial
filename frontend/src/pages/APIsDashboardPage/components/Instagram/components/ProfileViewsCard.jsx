import MetricSparkCard from "./MetricSparkCard";

function ProfileViewsCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Visitas al perfil"}
            titleSpinner="Obteniendo visitas al perfil de Instagram..."
            titleError="Ocurrio un error al obtener visitas al perfil"
            singular="visita"
            plural="visitas"
            cumulativeLabel="acumuladas"
            gradientId="instagram-profile-views-gradient"
        />
    );
}

export default ProfileViewsCard;
