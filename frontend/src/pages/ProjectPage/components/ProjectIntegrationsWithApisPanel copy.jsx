import { Grid } from "@mui/material";

import { GithubApi } from './GitHubAPI';
import { FacebookApi } from './FacebookAPI';
import { InstagramApi } from './InstagramAPI';
import { XApi } from "./XAPI";

export const ProjectIntegrationsWithApisPanel = ({ panelHeight, selectedIntegrations, onChange }) => {
    const normalized = selectedIntegrations.map(i => ({
        type: i.type || i.platform,
        data: i.data || i,         
    }));

    const githubSelected = normalized.filter(i => i.type === 'github').map(i => i.data);
    const facebookSelected = normalized.filter(i => i.type === 'facebook').map(i => i.data);
    const instagramSelected = normalized.filter(i => i.type === 'instagram').map(i => i.data);
    const xSelected = normalized.filter(i => i.type === 'x').map(i => i.data);

    const handleGithubChange = (items) => {
        const others = selectedIntegrations.filter(i => i.type !== 'github');
        const githubItem = items[0];
        onChange?.([
            ...others,
            ...(githubItem ? [{ type: 'github', data: githubItem }] : [])
        ]);
    };

    const handleFacebookChange = (items) => {
        const others = selectedIntegrations.filter(i => i.type !== 'facebook');
        const facebookItem = items[0];
        onChange?.([
            ...others,
            ...(facebookItem ? [{ type: 'facebook', data: facebookItem }] : [])
        ]);
    };

    const handleInstagramChange = (items) => {
        const others = selectedIntegrations.filter(i => i.type !== 'instagram');
        const instagramItem = items[0];
        onChange?.([
            ...others,
            ...(instagramItem ? [{ type: 'instagram', data: instagramItem }] : [])
        ]);
    };

    const handleXChange = (items) => {
        const others = selectedIntegrations.filter(i => i.type !== 'x');
        const xItem = items[0];
        onChange?.([
            ...others,
            ...(xItem ? [{ type: 'x', data: xItem }] : [])
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
