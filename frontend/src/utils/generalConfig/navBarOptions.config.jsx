import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';

export const navBarOptionsConfig = {
  admin: [
    { text: "Planificación Estratégica", link: "/planificacion/estrategica", icon: <AccountTreeRoundedIcon /> },
    { text: "Planificación Operativa", link: "/planificacion/operativa", icon: <TableChartRoundedIcon /> },
    { text: "Proyectos", link: "/proyectos", icon: <FolderCopyRoundedIcon /> },
    { text: "Usuarios", link: "/usuarios", icon: <PeopleOutlineRoundedIcon /> },
    { text: "Dashboard de APIs", link: "/dashboard", icon: <AssessmentRoundedIcon /> },
    { text: "Reportes", link: "/reportes", icon: <SummarizeRoundedIcon /> },
  ],
  coordinator: [
    { text: "Planificación Estratégica", link: "/planificacion/estrategica", icon: <AccountTreeRoundedIcon /> },
    { text: "Planificación Operativa", link: "/planificacion/operativa", icon: <TableChartRoundedIcon /> },
    { text: "Proyectos", link: "/proyectos", icon: <FolderCopyRoundedIcon /> },
    { text: "Dashboard de APIs", link: "/dashboard", icon: <AssessmentRoundedIcon /> },
    { text: "Reportes", link: "/reportes", icon: <SummarizeRoundedIcon /> },
  ],
};