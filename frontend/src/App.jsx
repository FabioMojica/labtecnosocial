import { Box, CssBaseline, Toolbar, useTheme } from '@mui/material';
import { SnackbarProvider } from "notistack";
import "react-quill-new/dist/quill.snow.css";

import { AuthProvider, CustomThemeProvider, HeaderHeightProvider, useAuth } from './contexts';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  LoginPage,
  NotFoundPage,
  HomePage,
  UsersListPage,
  ProjectsListPage,
  ProjectPage,
  CreateProjectPage,
  CreateUserPage,
  UserPage,
} from './pages';


import { Header, PrivateRoute, SessionExpirationModal } from './generalComponents';
import { useDrawerClosedWidth } from './utils';
import StrategicPlanningDashboardPage from './pages/StrategicPlan/StrategicPlanningDashboardPage';
import OperationalPlanningDashboardPage from './pages/OperationalPlan/OperationalPlanningDashboardPage';
import { ConfirmProvider } from 'material-ui-confirm';
import { APIsDashboardPage } from './pages/APIsDashboardPage/ApisDashboardPage';
import { ReportProvider } from './contexts/ReportContext';
import { useEffect, useRef, useState } from 'react';
import { ReportEditor } from './pages/ReportPage/ReportEditor';
import { useSnackbarStyles } from './pages/StrategicPlan/hooks/useSnackBarStyles';
import { useCloseTooltipsOnScroll } from './pages/StrategicPlan/hooks/useCloseTooltipsOnScroll';
import { DirtyProvider } from './contexts/DirtyContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { useLayoutOffsets } from './hooks/useLayoutOffsets';
import { ReportsListPage } from './pages/ReportListPage/ReportListPage';

export const ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  USER: "user",

  ALL_ROLES: ["super-admin", "admin", "user"],
  ONLY_ADMINS: ["super-admin", "admin"]
};

export const PublicRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/inicio" replace />;

  return <>{element}</>;
};


const AppContent = () => {
  const { isAuthenticated } = useAuth();


  return (
    <>
      {isAuthenticated && <Header />} 
      {isAuthenticated && <Toolbar />} 

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} /> 
        <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
        <Route path="/inicio" element={<PrivateRoute element={<HomePage />} allowedRoles={ROLES.ALL_ROLES} />} />
        <Route path="/usuarios" element={<PrivateRoute element={<UsersListPage />} allowedRoles={ROLES.ONLY_ADMINS} />} />
        <Route path="/usuarios/crear" element={<PrivateRoute element={<CreateUserPage />} allowedRoles={ROLES.ONLY_ADMINS} />} />
        <Route path="/usuario/:email" element={<PrivateRoute element={<UserPage />} allowedRoles={ROLES.ALL_ROLES} />} />
        <Route path="/proyectos" element={<PrivateRoute element={<ProjectsListPage />} allowedRoles={ROLES.ALL_ROLES} />} />
        <Route path="/proyectos/crear" element={<PrivateRoute element={<CreateProjectPage />} allowedRoles={ROLES.ONLY_ADMINS} />} />
        <Route path="/proyecto/:name" element={<PrivateRoute element={<ProjectPage />} allowedRoles={ROLES.ALL_ROLES} />} />
        <Route path="/planificacion-estrategica/:year" element={<PrivateRoute element={<StrategicPlanningDashboardPage />} allowedRoles={ROLES.ALL_ROLES} />} />
        <Route path="/planificacion-operativa/:name?" element={<PrivateRoute element={<OperationalPlanningDashboardPage />} allowedRoles={ROLES.ALL_ROLES} />} />
        <Route path="/dashboard" element={<PrivateRoute element={<APIsDashboardPage />} allowedRoles={ROLES.ALL_ROLES} />} />
        <Route path="/reportes" element={<PrivateRoute element={<ReportsListPage />} allowedRoles={ROLES.ALL_ROLES} />} />
        <Route path="/reportes/editor/:name?" element={<PrivateRoute element={<ReportEditor />} allowedRoles={ROLES.ALL_ROLES} />} /> 
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </>
  );  
};

function App() {
  const theme = useTheme();
  const snackbarClasses = useSnackbarStyles();
  const [modalOpen, setModalOpen] = useState(false);
  useCloseTooltipsOnScroll();
  const containerRef = useRef(null);
  const layoutOffsets = useLayoutOffsets(containerRef);

  return (
    <CustomThemeProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        classes={{
          containerRoot: snackbarClasses.containerRoot,
          containerAnchorOriginTopCenter: snackbarClasses.containerAnchorOriginTopCenter,
        }}
      >
        <BrowserRouter>
          <LayoutProvider value={layoutOffsets}>
            <DirtyProvider>
              <AuthProvider>
                <ConfirmProvider>
                  <HeaderHeightProvider>
                      <ReportProvider>
                        <CssBaseline />
                        <SessionExpirationModal />
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Box
                            ref={containerRef}
                            sx={{
                              flexGrow: 1,
                              minHeight: '100vh',
                              pl: { 
                                lg: useDrawerClosedWidth(), 
                              }, 
                              maxWidth: 2000,
                            }}> 
                            <Box sx={{
                              width: '100%',
                              px: {xs: 0, lg: 1},
                            }}>
                              <AppContent /> 
                            </Box>
                          </Box>
                        </Box>
                      </ReportProvider>
                  </HeaderHeightProvider>
                </ConfirmProvider>
              </AuthProvider>
            </DirtyProvider>
          </LayoutProvider>
        </BrowserRouter>
      </SnackbarProvider>
    </CustomThemeProvider>
  );
}

export default App;
