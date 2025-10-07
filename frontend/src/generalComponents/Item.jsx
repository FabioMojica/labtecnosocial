import { Paper, Box, ListItem, ListItemButton } from "@mui/material";


export const Item = ({
  leftComponents = [],
  rightComponents = [],
  sx = {},
  onClick,
}) => {
  return (
    <ListItem disablePadding>
      <Paper
        elevation={2} 
        sx={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 1,
          ...sx,
        }}
      >
        <ListItemButton
          onClick={onClick}
          sx={{
            display: "flex",
            flexDirection: {
              md: 'row',
              xs: 'column'
            },
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            p: 1,
            flexWrap: "wrap",
          }}
        >
          {/* Izquierda */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: 'flex-start',
              gap: 1,
              flexWrap: "wrap",
              width: {
                md: '50%',
                xs: '100%',
              },
            }}
          >
            {leftComponents.map((component, index) => (
              <Box key={index}>{component}</Box>
            ))}
          </Box>

          {/* Derecha */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: {
                md: "flex-end",
                xs: "center"
              },
              gap: 2,
              flexWrap: "wrap",
              width: {
                md: '50%',
                xs: '100%',
              }
            }}
          >
            {rightComponents.map((component, index) => (
              <Box key={index}>{component}</Box>
            ))}
          </Box>
        </ListItemButton>
      </Paper>
    </ListItem>
  );
};
