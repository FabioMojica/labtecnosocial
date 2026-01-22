import QuestionMarkRoundedIcon from "@mui/icons-material/QuestionMarkRounded";
import { roleConfig, roleConfigWithoutSA, stateConfig } from "./generalConfig";

export const getRoleAndStateData = (user) => {
  // ---- Valor seleccionado ----
  const roleData =
    Object.values(roleConfig).find(r => r.value === user?.role) ?? {};
  const stateData =
    Object.values(stateConfig).find(s => s.value === user?.state) ?? {};

  const selected = {
    role: {
      value: user?.role,
      label: roleData.label ?? user?.role,
      icon: roleData.icon ?? QuestionMarkRoundedIcon,
    },
    state: {
      value: user?.state,
      label: stateData.label ?? user?.state,
      color: stateData.color ?? "inherit",
    },
  };

  // ---- Arrays completos para los selects ----
  const roleOptions = Object.values(roleConfig)
    .filter(r => typeof r.value === "string") 
    .map(r => ({
      value: r.value,
      label: r.label,
      icon: r.icon ?? QuestionMarkRoundedIcon,
    }));

  const stateOptions = Object.values(stateConfig)
    .filter(s => typeof s.value === "string") 
    .map(s => ({
      value: s.value,
      label: s.label,
      color: s.color ?? "inherit",
    }));

  return {
    selected,
    options: {
      role: roleOptions,
      state: stateOptions,
    },
  };
};

export const getRoleAndStateDataWithoutSA = (user) => {
  // ---- Valor seleccionado ----
  const roleData =
    Object.values(roleConfigWithoutSA).find(r => r.value === user?.role) ?? {};
  const stateData =
    Object.values(stateConfig).find(s => s.value === user?.state) ?? {};

  const selected = {
    role: {
      value: user?.role,
      label: roleData.label ?? user?.role,
      icon: roleData.icon ?? QuestionMarkRoundedIcon,
    },
    state: {
      value: user?.state,
      label: stateData.label ?? user?.state,
      color: stateData.color ?? "inherit",
    },
  };

  // ---- Arrays completos para los selects ----
  const roleOptions = Object.values(roleConfigWithoutSA)
    .filter(r => typeof r.value === "string") 
    .map(r => ({
      value: r.value,
      label: r.label,
      icon: r.icon ?? QuestionMarkRoundedIcon,
    }));

  const stateOptions = Object.values(stateConfig) 
    .filter(s => typeof s.value === "string") 
    .map(s => ({
      value: s.value,
      label: s.label,
      icon: s.icon,
      color: s.color ?? "inherit",
    }));

  return {
    selected,
    options: {
      role: roleOptions,
      state: stateOptions,
    },
  };
};

export const getUserIcons = (user) => {
  const { selected } = getRoleAndStateData(user);

  return {
    RoleIcon: selected.role.icon,
    StateIcon: selected.state.icon,
  };
};
