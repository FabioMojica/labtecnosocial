import { Menu, MenuItem as MuiMenuItem } from "@mui/material";

const MenuItem = ({ position, onClose }) => {
  return (
    <Menu
      open={Boolean(position)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        position ? { top: position.y, left: position.x } : undefined
      }
    >
      <MuiMenuItem onClick={onClose}>Cerrar</MuiMenuItem>
      <MuiMenuItem onClick={onClose}>Añadir</MuiMenuItem>
    </Menu>
  );
};

export default MenuItem;
