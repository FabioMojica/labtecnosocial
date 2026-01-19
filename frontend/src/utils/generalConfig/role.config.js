import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AddModeratorIcon from '@mui/icons-material/AddModerator';

export const roleConfig = {
    admin: {
        value: "admin",
        icon: AdminPanelSettingsIcon, 
        label: 'Administrador',
    },
    superAdmin: {
        value: "super-admin",
        icon: AddModeratorIcon, 
        label: 'Super Administrador',
    },
    coordinator: {
        value: "coordinator",
        icon: PersonIcon,
        label: 'Coordinador',
    },
};


export const roleConfigWithoutSA = {
    admin: {
        value: "admin",
        icon: AdminPanelSettingsIcon, 
        label: 'Administrador',
    },
    coordinator: {
        value: "coordinator",
        icon: PersonIcon,
        label: 'Coordinador',
    },
};
