import { jwtDecode } from "jwt-decode";

export const saveSession = (token, user) => {
  const decoded = jwtDecode(token);
  const expTime = decoded.exp * 1000;
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
  sessionStorage.setItem("token_expiration", expTime.toString());
};

export const clearSession = () => {
  console.log("clear")
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("token_expiration");
  sessionStorage.removeItem("homeData");
  localStorage.removeItem("operationalPlanningViewMode");
};
