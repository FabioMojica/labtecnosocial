import { Box, useTheme } from "@mui/material";

export const BoxContainer = ({
  borderColor,
  backgroundColor,
  boxShadow,
  borderWidth,
  borderRadius,
  padding,
  children,
  className = "",
  ...rest
}) => {
  const theme = useTheme();
  const resolvedBorderColor = borderColor ?? theme.palette.primary.light;
  const resolvedBackgroundColor =
    backgroundColor ?? theme.palette.primary.backgroundBox;
  const resolvedBoxShadowColor =
    boxShadow ?? theme.palette.primary.boxShadowBox;

  const boxStyle = {
    border: `${borderWidth || "0px"} solid ${resolvedBorderColor}`,
    borderRadius: borderRadius || "8px",
    padding: padding || "16px",
    backgroundColor: backgroundColor || resolvedBackgroundColor,
    boxShadow: '0 4px 12px rgba(0,0,0,1)',
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Box style={boxStyle} className={className} {...rest}>
      {children}
    </Box>
  );
};
