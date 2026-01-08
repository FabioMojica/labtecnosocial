import React, { useEffect } from "react";
import { Button, CircularProgress, useTheme } from "@mui/material";

export const ButtonWithLoader = ({
  loading = false,
  loaderSize = 24,
  loaderColor = "inherit",
  backgroundButton,
  children,
  disabled,
  className = "",
  triggerOnEnter = false,
  onClick,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const resolvedLoaderColor =
    loaderColor ?? theme.palette.primary.principal;
  const resolvedBackgroundButtonColor =
    backgroundButton ?? theme.palette.primary.buttonsBackgroundMain;

  useEffect(() => {
    if (!triggerOnEnter || !onClick) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !disabled && !loading) {
        onClick(e);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerOnEnter, onClick, disabled, loading]);

  return (
    <Button
      disabled={disabled || loading}
      className={className}
      onClick={onClick}
      {...props}
      sx={{
        position: "relative",
        minHeight: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: resolvedBackgroundButtonColor,
        ...sx,
      }}
    >
      {loading ? (
        <CircularProgress size={loaderSize} color={resolvedLoaderColor} />
      ) : (
        children
      )}
    </Button>
  );
};
