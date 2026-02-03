export const Routes = {
  auth: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    GET_SUMMARY_DATA: '/auth/sumaryData',
    ME: "/auth/me",
    TOKEN_REFRESH: "/auth/refresh",
  },

  users: {
    GET_ALL_USERS: "/users/getAllUsers",
    GET_ALL_ADMINS: "/users/getAllAdmins",
    GET_USER_BY_EMAIL: "/users/getUserByEmail",
    CREATE_USER: "/users/createUser",
    UPDATE_USER: "/users/updateUser",
    DELETE_USER: "/users/deleteUser",
  },

  CREATE_PROJECT: "/projects/create",
  GET_ALL_PROJECTS: "/projects/getAll",
  GET_PROJECT_BY_ID: "/projects/getProjectById",
  UPDATE_PROJECT: "/projects",
  DELETE_PROJECT: "/projects",

  //Plan. operativa
  OPERATIONAL_PLAN: "/operational-plans",
  UPDATE_OPERATIONAL_PLAN: "/operational-plans/updateOperationalPlan",
  DELETE_OPERATIONAL_PLAN: "/operational-plans/deleteOperationalPlan",


  //Plan. estrategica
  STRATEGIC_PLAN: "/strategic-plans",
  UPDATE_STRATEGIC_PLAN: "/strategic-plans/updateStrategicPlan",
  DELETE_STRATEGIC_PLAN: "/strategic-plans/deleteStrategicPlan",

  //Dashboard
  dashboard: {
    GET_PROJECTS_WITH_INTEGRATIONS: "/dashboard/getProjectsWithIntegrations",
  },

  reports: {
    REPORTS: "/reports",
    CREATE_REPORT: "/reports/createReport",
    SAVE_REPORT: (reportId) => `/reports/${reportId}`,
    GET_REPORT: (reportId) => `/reports/${reportId}`,
    DELETE_REPORT: (reportId) => `/reports/${reportId}`,
  },

  github: {
    REPOS: "/apis/github/repos", 
    BRANCHES: (repoName) => `/apis/github/${repoName}/branches`,
    STATS: (projectName) => `/apis/github/${projectName}/github-stats`,
  },
 
  facebook: { 
    PAGES: "apis/facebook/pages", 
    PAGE_OVERVIEW: (pageId) => `/apis/facebook/${pageId}/overview`,
    PAGE_INSIGHTS: (pageId) => `/apis/facebook/${pageId}/insights`,
    PAGE_POSTS: (pageId) => `/apis/facebook/${pageId}/posts`,
  },

  instagram: { 
    PAGES: "apis/instagram/pages", 
  },

  x: { 
    ACCOUNTS: "apis/x/accounts", 
  },
};