export const Routes = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout", 

  GET_ALL_USERS: "/users/getAllUsers",
  GET_USER_BY_EMAIL: "/users/getUserByEmail",
  CREATE_USER: "/users/createUser",
  DELETE_USER: "/users/deleteUser",
   
  GET_SUMMARY_DATA: '/projects/sumaryData',
  CREATE_PROJECT: "/projects/create",
  GET_ALL_PROJECTS: "/projects/getAll",
  GET_PROJECT_BY_ID: "/projects/getProjectById", 
  UPDATE_PROJECT: "/projects",
  DELETE_PROJECT: "/projects",

  //Plan. estrategica
  STRATEGIC_PLAN: "/strategic-plans",
  UPDATE_STRATEGIC_PLAN: "/strategic-plans/updateStrategicPlan",
  DELETE_STRATEGIC_PLAN: "/strategic-plans/deleteStrategicPlan",
  
  GET_OBJECTIVES: "/objectives",
  CREATE_OBJECTIVE: "/objectives",
  UPDATE_OBJECTIVE: "/objectives",
  DELETE_OBJECTIVE: "/objectives",
  GET_INDICATORS: "/indicators",
  CREATE_INDICATOR: "/indicators",
  UPDATE_INDICATOR: "/indicators",
  DELETE_INDICATOR: "/indicators",


  GET_GITHUB_REPOS: "/apis/github/repos",
  GET_FACEBOOK_PAGES: "/apis/facebook/pages",
  GET_INSTAGRAM_PAGES: "/apis/instagram/pages",
  GET_X_ACCOUNTS: "/apis/X/accounts",

  
  ME: "/auth/me",
  TOKEN_REFRESH:  "/auth/refresh",
};