import React from "react";
import { Avatar, Box, Typography, Checkbox, Tooltip, useTheme } from "@mui/material";
import { Item } from "./Item";
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { roleConfig, stateConfig } from "../utils";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const AssignResponsibleCheckBoxItem = ({
  responsible,
  checked = false,
  onChange,
}) => {
  const theme = useTheme();

  const roleData = roleConfig[responsible.role] ?? {
    icon: QuestionMarkRoundedIcon,
    role: responsible.role,
  };

  const stateData = stateConfig[responsible.state] ?? {
    icon: QuestionMarkRoundedIcon,
    label: responsible.state,
    color: "error.main",
  };

  const handleToggle = () => {
    const newChecked = !checked;

    onChange?.(newChecked);
  };

  return (
    <Item
      onClick={(e) => {
        handleToggle();
      }}

      leftComponents={[
        <Box
          sx={{ display: "flex", gap: 1, }}

        >
          <Avatar
            src={responsible.image_url ? `${API_UPLOADS}${responsible.image_url}` : ""}
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              objectFit: "cover",
              fontWeight: "bold",
              boxShadow:
                                    theme.palette.mode === 'light'
                                        ? '0 0 0 1px rgba(0,0,0,0.3)'
                                        : '0 0 0 1px rgba(255,255,255,0.3)',
            }}
          >
            {responsible.firstName?.[0]?.toUpperCase() ?? ""}
  {responsible.lastName?.[0]?.toUpperCase() ?? ""}
          </Avatar>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Typography>{responsible.firstName}</Typography>
            <Typography>{responsible.lastName}</Typography>
            <Typography variant="caption">{responsible.email}</Typography>
          </Box>
        </Box>
      ]}
      rightComponents={[
        <Box
          key="right"
          sx={{
            display: "flex",
            height: "100%",
            marginTop: { xs: 2, sm: 0 },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1
          }}
        >
          <Box
            sx={{
              display: "flex",
              minWidth: { sm: 100, xs: 50 },
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography>{responsible.projectCount}</Typography>
            <Typography variant="caption" fontSize={{ xs: '0.6rem', sm: '1rem' }}>Proyectos</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              minWidth: { sm: 100, xs: 50 },
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {React.createElement(roleData.icon, { fontSize: "small" })}
            <Typography variant="caption" fontSize={{ xs: '0.6rem', sm: '1rem' }}>{responsible.role}</Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              minWidth: { sm: 100, xs: 50 },
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {React.createElement(stateData.icon, {
              fontSize: "small",
              sx: { color: stateData.color },
            })}
            <Typography variant="caption" fontSize={{ xs: '0.6rem', sm: '1rem' }}>{responsible.state}</Typography>
          </Box>
          <Checkbox
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            onClick={(e) => {
              handleToggle();
            }}
          />
        </Box>,
      ]}
    />
  );
};
