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

    USER: {
        READ:   'user:read', 
        READ_ALL_ADMINS: 'user:read-all-admins',
        
        CREATE: 'user:create',
        UPDATE: 'user:update', 
        DELETE: 'user:delete',
    }
};
 
const all = (...modules) => 
    modules.flatMap(m => Object.values(m));
 
export const ROLE_PERMISSIONS = {
    [ALLOWED_ROLES.superAdmin]: all( 
        PERMISSIONS.STRATEGIC_PLAN, 

        PERMISSIONS.OPERATIONAL_PLAN, 

        PERMISSIONS.USER,
    ), 

    [ALLOWED_ROLES.admin]: [
        PERMISSIONS.STRATEGIC_PLAN.READ, 
        PERMISSIONS.STRATEGIC_PLAN.UPDATE, 
 
        PERMISSIONS.OPERATIONAL_PLAN.READ,
        PERMISSIONS.OPERATIONAL_PLAN.UPDATE,

        PERMISSIONS.USER.READ,
        PERMISSIONS.USER.CREATE,
        PERMISSIONS.USER.UPDATE,
        PERMISSIONS.USER.DELETE,
    ],

    [ALLOWED_ROLES.user]: [
        PERMISSIONS.STRATEGIC_PLAN.READ,

        PERMISSIONS.OPERATIONAL_PLAN.READ,

        PERMISSIONS.USER.READ,
        PERMISSIONS.USER.UPDATE,
    ],
};
