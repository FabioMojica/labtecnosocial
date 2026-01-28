import { Avatar, Box, Divider, Typography, useTheme } from "@mui/material";
import { Item } from "../../../generalComponents";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import UpdateIcon from "@mui/icons-material/Update";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";
import { formatDate, formatDateParts } from "../../../utils/formatDate";

// Mini componente para cada estadística a la derecha
const RightStat = ({ icon, value, label }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: 80,
      textAlign: "center",
    }}
  >
    {icon}
    <Typography variant="caption" color="textSecondary">
      {value}
    </Typography> 
    <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.7rem" }}>
      {label}
    </Typography>
  </Box>
);

export const ProjectItem = ({ project, onClick }) => {
  const theme = useTheme();

  const imageSrc = project?.image_url || null;

  return (
    <Item
      leftComponents={[
        <Box sx={{ display: 'flex', flexDirection: 'column' ,width : '100%', height: '100%'}}>
          <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,  
            alignItems: "center",
            justifyContent: "start",
            alignItems: 'center'
          }}
        >
          <Avatar
            src={imageSrc ?? undefined}
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              objectFit: "cover",
              fontWeight: "bold",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0 0 0 1px rgba(0,0,0,0.3)"
                  : "0 0 0 1px rgba(255,255,255,0.3)",
            }}
          >
            {project.name[0].toUpperCase()}
          </Avatar>

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {/* Nombre del proyecto */}
            <Typography
              fontWeight="bold"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {project.name}
            </Typography> 

            {/* Descripción */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {project.description}
            </Typography>
          </Box>
        </Box>
          <Divider
          sx={{
            display: {
              xs: "block",
              sm: "none",
            },
            my: 1,
          }} 
        />

        </Box>
      ]}
      rightComponents={[
        <Box
          sx={{
            display: "flex",
            mt: { xs: 2, sm: 0 },
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: { xs: "space-around", sm: "center" },
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <RightStat 
            icon={<GroupIcon fontSize="small" />}
            value={project.projectResponsibles?.length ?? 0}
            label="Responsables"
          />
          <RightStat
            icon={<LinkIcon fontSize="small" />}
            value={project.integrations?.length ?? 0}
            label="Integraciones"
          />
          <RightStat
            icon={<CalendarMonthIcon fontSize="small" />}
            value={formatDateParts(project.created_at).date}
            label="Fecha creación"
          />
          <RightStat
            icon={<UpdateIcon fontSize="small" />}
            value={formatDateParts(project.updated_at).date}
            label="Fecha actualización"
          />
        </Box>,
      ]}
      onClick={onClick} 
    />
  );
};
