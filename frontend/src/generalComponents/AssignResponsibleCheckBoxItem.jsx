import React from "react";
import { Avatar, Box, Typography, Checkbox, Tooltip, useTheme, Button } from "@mui/material";
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

  const roleData = Object.values(roleConfig).find(r => r.value === responsible?.role);
  const RoleIcon = roleData?.icon ?? QuestionMarkRoundedIcon;
  const roleLabel =
    Object.values(roleConfig).find(r => r.value === responsible?.role) ?? {
      label: user?.role,
    };

  const stateData = Object.values(stateConfig).find(r => r.value === responsible?.state);
  const StateIcon = stateData?.icon ?? QuestionMarkRoundedIcon
  const stateLabel = stateData?.label;
  const stateColor = stateData?.color;


  return (
    <Item 
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
            flex: 1,
            height: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            width: '100%',
            mt: {
              xs: 1,
              lg: 0
            }
          }}
        >
          <Box sx={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            gap: {
              xs: 1,
              lg: 0
            }
          }}>
            <Box
              sx={{
                display: "flex",
                minWidth: { sm: 100, xs: 50 },
                flexDirection: "column",
                justifyContent: 'center',
                height: '100%',
                alignItems: "center",
                gap: 0.5
              }}
            >
              <Typography lineHeight={1}>{responsible.projectCount}</Typography>
              <Typography lineHeight={1} variant="caption" fontSize={{ xs: '0.6rem', sm: '1rem' }}>Proyectos</Typography>
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

              <Typography
                sx={{
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  width: 200
                }}
                variant="caption"
                textAlign={'center'}
                fontSize={{ xs: '0.6rem', sm: '1rem' }}
              >
                {roleLabel.label}
              </Typography>

            </Box>
            <Box
              sx={{
                display: "flex",
                minWidth: { sm: 100, xs: 50 },
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {React.createElement(StateIcon, {
                fontSize: "small",
                sx: { color: stateColor },
              })}
              <Typography variant="caption" fontSize={{ xs: '0.6rem', sm: '1rem' }}>{stateLabel}</Typography>
            </Box>
          </Box>
        </Box>,
        <Button
          sx={{
            height: 36,
            minWidth: '100px',
            border: "none",
            borderRadius: 1,
            cursor: "pointer", 
            bgcolor:
            checked ? theme.palette.error.main : theme.palette.success.main,
            color: theme.palette.error.contrastText,
            fontSize: "0.9rem",
          }}
          onClick={() => onChange?.(!checked)}
        >
          {checked ? "Desasignar" : "Asignar"}
        </Button>
      ]}
    />
  );
};
