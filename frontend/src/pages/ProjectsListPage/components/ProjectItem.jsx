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
        <Box sx={{display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center', justifyContent: 'center'}}>
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
        </Avatar>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {/* Nombre del proyecto: máximo 1 línea con ... si excede */}
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

          {/* Descripción: máximo 2 líneas con ... si excede */}
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

          {project.program && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {project.program.description} / {project.program.objective?.title ?? ""}
            </Typography>
          )}
        </Box>
        </Box>
      ]}

      rightComponents={[
        <Box sx={{ display: 'flex', mt: { xs: 2 }, height: '100%', width: 200, alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-end' }, gap: 3 }}>
          <Tooltip title="Responsables" arrow>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <GroupIcon fontSize="small" />
              <Typography variant="caption">
                {project.projectResponsibles?.length ?? 0}
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip title="Integraciones" arrow>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <LinkIcon fontSize="small" />
              <Typography variant="caption">
                {project.integrations?.length ?? 0}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      ]}
      onClick={onClick}
    />
  );
};
