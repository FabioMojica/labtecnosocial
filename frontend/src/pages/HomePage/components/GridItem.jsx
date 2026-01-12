import { Box, Typography, Stack, Paper } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export const GridItem = ({ title, description, icon, link }) => {
    const content = (
        <Paper
            sx={{
                p: 1,
                borderRadius: 2,
                boxShadow: 2,
                bgcolor: "background.paper",
                textAlign: "center",
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s",
                cursor: link ? "pointer" : "default",
                height: '100%',
                mx: {
                    xs: 2,
                    sm: 0,
                },
                maxHeight: {
                    xs: '100%',
                    md: '100%',
                },
                maxWidth: {
                    xs: '100%',
                    md: '280px'
                },
                "&:hover": {
                    transform: "scale(1.04)",
                    boxShadow: 6,
                },
            }}
        >
            <Stack alignItems="center">
                <Box sx={{ color: "primary.main" }}>
                    {icon}
                </Box>
                <Typography variant="h6">{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </Stack>
        </Paper>
    );

    return link ? (
        <RouterLink to={link} style={{ textDecoration: "none", color: "inherit" }}>
            {content}
        </RouterLink>
    ) : (
        content
    );
};
