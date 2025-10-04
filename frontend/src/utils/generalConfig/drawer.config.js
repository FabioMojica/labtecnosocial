export const drawerWidth = 270;

export const getDrawerClosedWidth = (theme, breakpoint = "xs") => {
  const spacing7 = theme.spacing(7); 
  const spacing8 = theme.spacing(8); 
  const base = breakpoint === "sm" ? spacing8 : spacing7;
  return `calc(${base} + 8px)`;
};
