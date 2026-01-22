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
    user: {
        value: "user",
        icon: PersonIcon,
        label: 'Usuario',
    },
    rolesArray: [
        "admin", "super-admin", "user"
    ]
};


export const roleConfigWithoutSA = {
    admin: {
        value: "admin",
        icon: AdminPanelSettingsIcon, 
        label: 'Administrador',
    },
    user: {
        value: "user",
        icon: PersonIcon,
        label: 'Usuario',
    },
};
