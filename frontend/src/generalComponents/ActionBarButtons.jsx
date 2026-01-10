import { Box, Button } from "@mui/material";
import { useEffect } from "react";
import PropTypes from "prop-types";

export const ActionBarButtons = ({
  visible = true,
  position = { bottom: 20, right: 20 },
  gap = 2,
  buttons,
  sx = {},
  sxButtons = {}
  
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        const btn = buttons.find((b) => b.triggerOnEnter && !b.disabled);
        if (btn) {
          e.preventDefault();
          btn.onClick();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [buttons]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        display: "flex",
        gap,
        zIndex: 1300,
        padding: 1.5,
        borderRadius: 2,
        backgroundColor: "background.paper",
        boxShadow: 6,
        ...position,
        ...sx,
      }}
    >

      {buttons.map((btn, idx) => (
        <Button
          key={idx}
          variant={btn.variant ?? "contained"}
          color={btn.color ?? "primary"}
          startIcon={btn.icon}
          onClick={btn.onClick}
          disabled={btn.disabled ?? false}
          sx={{
            fontSize: {
              xs: '0.7rem',
              sm: '0.9rem',
            },
            ...sxButtons,
          }}
        >
          {btn.label}
        </Button>
      ))}
    </Box>
  );
};

// Validación de props en JS
ActionBarButtons.propTypes = {
  visible: PropTypes.bool,
  position: PropTypes.shape({
    bottom: PropTypes.number,
    right: PropTypes.number,
    left: PropTypes.number,
    top: PropTypes.number,
  }),
  gap: PropTypes.number,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      variant: PropTypes.oneOf(["contained", "outlined", "text"]),
      color: PropTypes.oneOf([
        "primary",
        "secondary",
        "error",
        "success",
        "info",
        "warning",
      ]),
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      triggerOnEnter: PropTypes.bool,
    })
  ).isRequired,
  sx: PropTypes.object,
};
