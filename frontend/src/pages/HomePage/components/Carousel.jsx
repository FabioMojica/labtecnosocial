import { Paper, Box } from "@mui/material";


export const Carousel = ({
  width,
  height,
  items,
  speed = 20,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width,
        height,
        overflow: "hidden",
        borderRadius: 3,
        position: "relative",
      }} 
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: 'center',
          alignItems: 'center',
          width: "max-content",
          height: '100%',
          animation: `scroll ${speed}s linear infinite`,
        }}
      >
        {[...items, ...items].map((item, index) => (
          <Box
            key={index}
            sx={{
              flex: "0 0 auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mx: 1, 
            }}
          >
            {item}
          </Box>
        ))}
      </Box>

      <style>
        {`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </Paper>
  );
};
