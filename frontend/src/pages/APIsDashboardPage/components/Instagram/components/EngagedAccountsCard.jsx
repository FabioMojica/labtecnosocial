import MetricSparkCard from "./MetricSparkCard";

function EngagedAccountsCard(props) {
    return (
        <MetricSparkCard
            {...props}
            title={props.title ?? "Cuentas con interaccion"}
            titleSpinner="Obteniendo cuentas con interaccion..."
            titleError="Ocurrio un error al obtener cuentas con interaccion"
            singular="cuenta"
            plural="cuentas"
            cumulativeLabel="acumuladas"
            gradientId="instagram-engaged-accounts-gradient"
        />
    );
}

export default EngagedAccountsCard;
