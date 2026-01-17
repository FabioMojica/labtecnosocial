import { Grid } from "@mui/material";

import { GithubApi } from './GitHubAPI';
import { FacebookApi } from './FacebookAPI';
import { InstagramApi } from './InstagramAPI';
import { XApi } from "./XAPI";
import { useEffect, useRef, useState } from "react";


export const ProjectIntegrationsWithApisPanel = ({ panelHeight, integrations, onChange, resetTrigger }) => {
    console.log("integraciones llegando desde el padre", integrations);
    const initialIntegrationsRef = useRef(integrations);

    const gitHubIntegration = initialIntegrationsRef.current.find(i => i.platform === 'github');
    const facebookIntegration = initialIntegrationsRef.current.find(i => i.platform === 'facebook');
    const instagramIntegration = initialIntegrationsRef.current.find(i => i.platform === 'instagram');
    const xIntegration = initialIntegrationsRef.current.find(i => i.platform === 'x');

    useEffect(() => {
        initialIntegrationsRef.current = integrations;
    }, [resetTrigger]);

    const [platformChanges, setPlatformChanges] = useState({
        github: { intAnadidos: [], intEliminados: [] },
        facebook: { intAnadidos: [], intEliminados: [] },
        instagram: { intAnadidos: [], intEliminados: [] },
        x: { intAnadidos: [], intEliminados: [] },
    });

    const handleChangePlatform = (platform) => ({
        intAnadidos = [],
        intEliminados = []
    }) => {
        setPlatformChanges(prev => {
            const updated = {
                ...prev,
                [platform]: { intAnadidos, intEliminados }
            };

            // 🔥 construir arrays globales
            const allAdded = Object.values(updated)
                .flatMap(p => p.intAnadidos);

            const allRemoved = Object.values(updated)
                .flatMap(p => p.intEliminados);

            onChange({
                intAnadidos: allAdded,
                intEliminados: allRemoved
            });

            return updated;
        });
    };

    return (
        <Grid container spacing={1} columns={4} sx={{ width: "100%", p: 1 }}>
            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <GithubApi
                    panelHeight={panelHeight}
                    gitHubIntegration={gitHubIntegration}
                    onChange={handleChangePlatform('github')}
                    resetTrigger={resetTrigger}
                />
            </Grid>
            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <FacebookApi
                    panelHeight={panelHeight}
                    facebookIntegration={facebookIntegration}
                    onChange={handleChangePlatform('facebook')}
                    resetTrigger={resetTrigger}
                />
            </Grid>

            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <InstagramApi 
                    panelHeight={panelHeight}
                    instagramIntegration={instagramIntegration}
                    onChange={handleChangePlatform('instagram')}
                    resetTrigger={resetTrigger}
                    />
            </Grid>
  
            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <XApi
                    panelHeight={panelHeight}
                    xIntegration={xIntegration}
                    onChange={handleChangePlatform('x')}
                    resetTrigger={resetTrigger}
                />
            </Grid> 
        </Grid>
    );
};
