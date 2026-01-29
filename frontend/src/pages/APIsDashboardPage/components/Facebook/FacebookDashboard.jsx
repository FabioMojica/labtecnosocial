import { Box, Grid } from "@mui/material";
import { useLayout } from "../../../../contexts/LayoutContext";
import { useDrawerClosedWidth } from "../../../../utils";
import FollowersCard from "./components/FollowersCard";
import TotalLikesCard from "./components/TotalLikesCard";
import TotalReactionsCard from "./components/TotalReactionsCard";
import PageViewsCard from "./components/PageViewsCard";


export const FacebookDashboard = ({ project, useMock = true }) => {
    const { scrollbarWidth } = useLayout();
    const navBarWidth = useDrawerClosedWidth();

    return (
        <Box sx={{ width: '100%', height: '100%', px: { xs: 1, lg: 0 }, py: { xs: 1, lg: 0 }, maxWidth: { xs: '100vw', lg: `calc(100vw - ${navBarWidth} - ${scrollbarWidth}px - 16px)` } }}>
            fave
            <Box sx={{ mt: 1 }}>
                <Grid container columns={12} spacing={1} size={{ xs: 12, sm: 12, lg: 6 }} sx={{ mb: 1 }}>
                     <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <FollowersCard />
                     </Grid>
                     <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TotalLikesCard />
                     </Grid>
                     <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <TotalReactionsCard />
                     </Grid>
                     <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <PageViewsCard />
                     </Grid>
                </Grid>
            </Box>
        </Box>
    );
}