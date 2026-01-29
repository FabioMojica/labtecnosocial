import { ALLOWED_ROLES } from "./allowedStatesAndRoles.js";

export const PERMISSIONS = {
    STRATEGIC_PLAN: {
        READ:   'strategic-plan:read', 
        CREATE: 'strategic-plan:create',
        UPDATE: 'strategic-plan:update', 
        DELETE: 'strategic-plan:delete',
    },

    OPERATIONAL_PLAN: {
        READ:   'operational-plan:read', 
        CREATE: 'operational-plan:create',
        UPDATE: 'operational-plan:update', 
        DELETE: 'operational-plan:delete',
    },

    OPERATIONAL_PROJECT: {
        READ:   'operational_project:read',
        CREATE: 'operational_project:create',
        UPDATE: 'operational_project:update',
        DELETE: 'operational_project:delete',
    },

    SUMMARY_DATA: {
        READ: 'summary_data:read',
    },

    USER: {
        READ:   'user:read', 
        READ_ALL_ADMINS: 'user:read-all-admins',
        
        CREATE: 'user:create',
        UPDATE: 'user:update', 
        DELETE: 'user:delete',
    },

    DASHBOARD: {
        READ:   'dashboard:read', 
    },

    AUTH: {
        REFRESH:   'auth:refresh', 
        ME:        'auth:me',
    }
};
 
const all = (...modules) => 
    modules.flatMap(m => Object.values(m));
 
export const ROLE_PERMISSIONS = {
    [ALLOWED_ROLES.superAdmin]: all( 
        PERMISSIONS.STRATEGIC_PLAN, 

        PERMISSIONS.OPERATIONAL_PLAN, 

        PERMISSIONS.OPERATIONAL_PROJECT,

        PERMISSIONS.SUMMARY_DATA,

        PERMISSIONS.USER, 

        PERMISSIONS.DASHBOARD,

        PERMISSIONS.AUTH,
    ), 

    [ALLOWED_ROLES.admin]: [
        PERMISSIONS.STRATEGIC_PLAN.READ, 
        PERMISSIONS.STRATEGIC_PLAN.UPDATE, 
 
        PERMISSIONS.OPERATIONAL_PLAN.READ,
        PERMISSIONS.OPERATIONAL_PLAN.UPDATE,

        PERMISSIONS.OPERATIONAL_PROJECT.READ,
        PERMISSIONS.OPERATIONAL_PROJECT.UPDATE,

        PERMISSIONS.SUMMARY_DATA,

        PERMISSIONS.USER.READ,
        PERMISSIONS.USER.CREATE,
        PERMISSIONS.USER.UPDATE,

        PERMISSIONS.DASHBOARD.READ,

        PERMISSIONS.AUTH
    ],

    [ALLOWED_ROLES.user]: [
        PERMISSIONS.STRATEGIC_PLAN.READ,

        PERMISSIONS.OPERATIONAL_PLAN.READ,

        PERMISSIONS.OPERATIONAL_PROJECT.READ,

        PERMISSIONS.SUMMARY_DATA,

        PERMISSIONS.USER.READ,
        PERMISSIONS.USER.UPDATE,

        PERMISSIONS.DASHBOARD.READ,

        PERMISSIONS.AUTH
    ],
};
