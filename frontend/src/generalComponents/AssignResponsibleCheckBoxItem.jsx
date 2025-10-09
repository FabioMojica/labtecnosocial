import React from "react";
import { Avatar, Box, Typography, Checkbox, Tooltip } from "@mui/material";
import { Item } from "./Item";
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { useSound } from "../contexts";
import { useAssignSounds } from "../hooks";
import { useNavigate } from "react-router-dom";
import { roleConfig, stateConfig } from "../utils";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const AssignResponsibleCheckBoxItem = ({
  responsible,
  checked = false,  
  onChange,
}) => {
  const navigate = useNavigate();

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
      leftComponents={[
        <Tooltip title="Ir al usuario" key="left">
          <Box
            sx={{ display: "flex", gap: 1 }}
            onClick={() => navigate(`/usuario/${responsible.email}`)}
          >
            <Avatar
              src={responsible.image_url ? `${API_UPLOADS}${responsible.image_url}` : undefined}
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                objectFit: "cover",
                fontWeight: "bold",
              }}
            >
              {responsible.firstName[0]}
              {responsible.lastName[0]}
            </Avatar>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography>{responsible.firstName}</Typography>
              <Typography>{responsible.lastName}</Typography>
              <Typography variant="caption">{responsible.email}</Typography>
            </Box>
          </Box>
        </Tooltip>,
      ]}
      rightComponents={[
        <Box
          key="right"
          sx={{
            display: "flex",
            height: "100%",
            width: { sm: 350, xs: 250 },
            marginTop: { xs: 2, sm: 0 },
            alignItems: "center",
            justifyContent: "space-between",
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
            <Typography variant="caption">Proyectos</Typography>
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
            <Typography variant="caption">{responsible.role}</Typography>
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
            <Typography variant="caption">{responsible.state}</Typography>
          </Box>
          <Checkbox
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
          />
        </Box>,
      ]}
    />
  );
};
