import PeopleOutlineRoundedIcon from '@mui/icons-material/PeopleOutlineRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import FolderCopyRoundedIcon from '@mui/icons-material/FolderCopyRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';

const currentYear = new Date().getFullYear();

export const navBarOptionsConfig = {
  superAdmin: {
    label: "super-admin",
    options: [
      { text: "Planificación Estratégica", link: `/planificacion-estrategica/${currentYear}`, icon: <AccountTreeRoundedIcon /> },
      { text: "Planificación Operativa", link: "/planificacion-operativa", icon: <TableChartRoundedIcon /> },
      { text: "Proyectos", link: "/proyectos", icon: <FolderCopyRoundedIcon /> },
      { text: "Usuarios", link: "/usuarios", icon: <PeopleOutlineRoundedIcon /> },
      { text: "Dashboard de APIs", link: "/dashboard", icon: <AssessmentRoundedIcon /> },
      { text: "Reportes", link: "/reportes", icon: <SummarizeRoundedIcon /> },
    ]
  },
  admin:
  {
    label: "admin",
    options: [
      { text: "Planificación Estratégica", link: `/planificacion-estrategica/${currentYear}`, icon: <AccountTreeRoundedIcon /> },
      { text: "Planificación Operativa", link: "/planificacion-operativa", icon: <TableChartRoundedIcon /> },
      { text: "Proyectos", link: "/proyectos", icon: <FolderCopyRoundedIcon /> },
      { text: "Usuarios", link: "/usuarios", icon: <PeopleOutlineRoundedIcon /> },
      { text: "Dashboard de APIs", link: "/dashboard", icon: <AssessmentRoundedIcon /> },
      { text: "Reportes", link: "/reportes", icon: <SummarizeRoundedIcon /> },
    ]
  },
  user: {
    label: "user",
    options: [
      { text: "Planificación Estratégica", link: `/planificacion-estrategica/${currentYear}`, icon: <AccountTreeRoundedIcon /> },
      { text: "Planificación Operativa", link: "/planificacion-operativa", icon: <TableChartRoundedIcon /> },
      { text: "Proyectos", link: "/proyectos", icon: <FolderCopyRoundedIcon /> },
      { text: "Dashboard de APIs", link: "/dashboard", icon: <AssessmentRoundedIcon /> },
      { text: "Reportes", link: "/reportes", icon: <SummarizeRoundedIcon /> },
    ]
  },
};