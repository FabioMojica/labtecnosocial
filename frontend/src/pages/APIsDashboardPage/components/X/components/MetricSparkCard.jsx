import { integrationsConfig } from "../../../../../utils";
import InstagramMetricSparkCard from "../../Instagram/components/MetricSparkCard";

export default function MetricSparkCard(props) {
    return (
        <InstagramMetricSparkCard
            {...props}
            color={props.color ?? integrationsConfig.x.color}
        />
    );
}
