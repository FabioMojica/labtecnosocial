export const Routes = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",

  
  GET_ALL_USERS: "/users/getAllUsers",
  GET_USER_BY_EMAIL: "/users/getUserByEmail",
  CREATE_USER: "/users/createUser",
  
  GET_SUMMARY_DATA: '/projects/sumaryData',
  CREATE_PROJECT: "/projects/create",
  GET_ALL_PROJECTS: "/projects/getAll",
  GET_PROJECT_BY_ID: "/projects/getProjectById", 
  UPDATE_PROJECT: "/projects",
  DELETE_PROJECT: "/projects",

  GET_GITHUB_REPOS: "/apis/github/repos",
  GET_FACEBOOK_PAGES: "/apis/facebook/pages",
  GET_INSTAGRAM_PAGES: "/apis/instagram/pages",
  GET_X_ACCOUNTS: "/apis/X/accounts",

  
  ME: "/auth/me",
  TOKEN_REFRESH:  "/auth/refresh",
};