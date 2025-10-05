import { Avatar, Box, Typography, Tooltip } from "@mui/material";
import { Item } from "../../../generalComponents";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import GroupIcon from "@mui/icons-material/Group";
import LinkIcon from "@mui/icons-material/Link";

const API_UPLOADS = import.meta.env.VITE_BASE_URL;

export const ProjectItem = ({ project, onClick }) => {

  const imageSrc = project.image_url
  ? `${API_UPLOADS}${project.image_url}`
  : undefined;

 
  return ( 
    <Item
      leftComponents={[
        <Avatar
          src={imageSrc ?? undefined}
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            objectFit: "cover",
            fontWeight: "bold",
          }}
        >
          {project.name[0]} 
        </Avatar>,

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography fontWeight="bold">{project.name}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {project.description} 
          </Typography>
          {project.program && (
            <Typography variant="caption" color="text.secondary">
              {project.program.description} / {project.program.objective?.title ?? ""}
            </Typography>
          )}
        </Box>,
      ]}

      rightComponents={[
        <Tooltip title="Responsables" arrow>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <GroupIcon fontSize="small" />
            <Typography variant="caption">
              {project.projectResponsibles?.length ?? 0}
            </Typography>
          </Box>
        </Tooltip>,

        project.integrations && project.integrations.length > 0 && (
          <Tooltip title="Integraciones" arrow>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <LinkIcon fontSize="small" />
              <Typography variant="caption"> 
                {project.integrations?.length ?? 0}
              </Typography>
            </Box>
          </Tooltip>
        ),

        <Tooltip title="Proyecto" arrow>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <WorkOutlineIcon fontSize="small" />
            <Typography variant="caption">Ver</Typography>
          </Box>
        </Tooltip>
      ]}
      onClick={onClick}
    />
  );
};
