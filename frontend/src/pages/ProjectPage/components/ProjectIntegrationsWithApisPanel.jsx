import { Grid } from "@mui/material";

import { GithubApi } from './GitHubAPI'; 
import { FacebookApi } from './FacebookAPI';
import { InstagramApi } from './InstagramAPI';
import { XApi } from "./XAPI";
import { useRef, useState } from "react";
 
export const ProjectIntegrationsWithApisPanel = ({ panelHeight, integrations, onChange }) => {
    console.log("selected integrations", integrations)

    const normalized = integrations.map(i => ({
        type: i.type || i.platform, 
        data: i.data || i, 
    }));
  
    const initialRef = useRef(normalized);

    const [selectedIntegrations, setSelectedIntegrations] = useState(normalized);

    const githubSelected = selectedIntegrations.filter(i => i.type === 'github').map(i => i.data);
    const facebookSelected = selectedIntegrations.filter(i => i.type === 'facebook').map(i => i.data);
    const instagramSelected = selectedIntegrations.filter(i => i.type === 'instagram').map(i => i.data);
    const xSelected = selectedIntegrations.filter(i => i.type === 'x').map(i => i.data);

    const handleChange = (type, items = []) => {
        const others = selectedIntegrations.filter(i => i.type !== type);
        const newItem = items[0] ? { type, data: items[0] } : null;
        const newIntegrations = newItem ? [...others, newItem] : others;

        setSelectedIntegrations(newIntegrations);

        // Comparación profunda: solo notificamos si cambia
        const isEqual = newIntegrations.length === initialRef.current.length &&
            newIntegrations.every(ni =>
                initialRef.current.some(ii => ii.type === ni.type && ii.data === ni.data)
            );

        if (!isEqual) {
            onChange?.(newIntegrations);
        }
    };

 
    return (
        <Grid container spacing={1} columns={4} sx={{ width: "100%", p: 1 }}>
            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <GithubApi
                    panelHeight={panelHeight}
                    selected={githubSelected}
                    onChange={(items) => handleChange('github', items)}
                />
            </Grid>
            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <FacebookApi
                    panelHeight={panelHeight} 
                    selected={facebookSelected}
                    onChange={(items) => handleChange('facebook', items)}
                    />
            </Grid>

            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <InstagramApi
                    panelHeight={panelHeight}
                    selected={instagramSelected}
                    onChange={(items) => handleChange('instagram', items)}
                    />
            </Grid>


            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <XApi
                    panelHeight={panelHeight}
                    selected={xSelected}
                    onChange={(items) => handleChange('x', items)}
                />
            </Grid> 
        </Grid>
    );
};
