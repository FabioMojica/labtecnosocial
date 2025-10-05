import { Grid } from "@mui/material";

import { GithubApi } from './GitHubAPI';
import { FacebookApi } from './FacebookAPI';
import { InstagramApi } from './InstagramAPI';
import { XApi } from "./XAPI";

export const IntegrationsWithAPIsPanel = ({ panelHeight, selectedIntegrations, onChange }) => {
    const githubSelected = selectedIntegrations.filter(i => i.type === 'github').map(i => i.data);
    const facebookSelected = selectedIntegrations.filter(i => i.type === 'facebook').map(i => i.data);
    const instagramSelected = selectedIntegrations.filter(i => i.type === 'instagram').map(i => i.data);
    const xSelected = selectedIntegrations.filter(i => i.type === 'x').map(i => i.data);

    // Handlers para cada API
    const handleGithubChange = (items) => {
        // Filtramos los demás tipos y reemplazamos los github
        const others = selectedIntegrations.filter(i => i.type !== 'github');
        onChange?.([
            ...others,
            ...items.map(r => ({ type: 'github', data: r }))
        ]);
    };

    const handleFacebookChange = (items) => {
        const others = selectedIntegrations.filter(i => i.type !== 'facebook');
        onChange?.([
            ...others,
            ...items.map(r => ({ type: 'facebook', data: r }))
        ]);
    };

    const handleInstagramChange = (items) => {
        const others = selectedIntegrations.filter(i => i.type !== 'instagram');
        onChange?.([
            ...others,
            ...items.map(r => ({ type: 'instagram', data: r }))
        ]);
    };

    const handleXChange = (items) => {
        const others = selectedIntegrations.filter(i => i.type !== 'x');
        onChange?.([
            ...others,
            ...items.map(r => ({ type: 'x', data: r }))
        ]);
    };


    return (
        <Grid container spacing={1} columns={4} sx={{ width: "100%", p: 1 }}>
            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <GithubApi panelHeight={panelHeight} selected={githubSelected} onChange={handleGithubChange} />
            </Grid>

            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <FacebookApi panelHeight={panelHeight} selected={facebookSelected} onChange={handleFacebookChange} />
            </Grid>
            
            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <InstagramApi panelHeight={panelHeight} selected={instagramSelected} onChange={handleInstagramChange} />
            </Grid>
            
            <Grid size={{ sm: 4, md: 1, xs: 4 }}>
                <XApi panelHeight={panelHeight} selected={xSelected} onChange={handleXChange} />
            </Grid>
        </Grid>
    );
};
