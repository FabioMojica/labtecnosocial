import { Box, CssBaseline, Toolbar, useTheme } from '@mui/material';
import { SnackbarProvider } from "notistack";

import { AuthProvider, CustomThemeProvider, HeaderHeightProvider, useAuth } from './contexts';
import { useAuthEffects } from './hooks';

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
import { getDrawerClosedWidth } from './utils';
import StrategicPlanningDashboardPage from './pages/StrategicPlan/StrategicPlanningDashboardPage';
import OperationalPlanningDashboardPage from './pages/OperationalPlan/OperationalPlanningDashboardPage';
import { ConfirmProvider } from 'material-ui-confirm';
import { APIsDashboardPage } from './pages/APIsDashboardPage/ApisDashboardPage';
import { ReportProvider } from './contexts/ReportContext';
import { ReportBubble } from './generalComponents/ReportBubble';
import { ReportModal } from './generalComponents/ReportModal';
import { useEffect, useRef, useState } from 'react';
import { ReportEditor } from './pages/Reports/ReportEditor';
import { useSnackbarStyles } from './pages/StrategicPlan/hooks/useSnackBarStyles';
import { useCloseTooltipsOnScroll } from './pages/StrategicPlan/hooks/useCloseTooltipsOnScroll';
import { DirtyProvider } from './contexts/DirtyContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { useLayoutOffsets } from './hooks/useLayoutOffsets';

export const ROLES = {
  ADMIN: "admin",
  COORDINATOR: "coordinator",
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
        <Route path="/inicio" element={<PrivateRoute element={<HomePage />} allowedRoles={[ROLES.ADMIN, ROLES.COORDINATOR]} />} />
        <Route path="/usuarios" element={<PrivateRoute element={<UsersListPage />} allowedRoles={[ROLES.ADMIN]} />} />
        <Route path="/usuarios/crear" element={<PrivateRoute element={<CreateUserPage />} allowedRoles={[ROLES.ADMIN]} />} />
        <Route path="/usuario/:email" element={<PrivateRoute element={<UserPage />} allowedRoles={[ROLES.ADMIN, ROLES.COORDINATOR]} />} />
        <Route path="/proyectos" element={<PrivateRoute element={<ProjectsListPage />} allowedRoles={[ROLES.ADMIN, ROLES.COORDINATOR]} />} />
        <Route path="/proyectos/crear" element={<PrivateRoute element={<CreateProjectPage />} allowedRoles={[ROLES.ADMIN]} />} />
        <Route path="/proyecto/:id" element={<PrivateRoute element={<ProjectPage />} allowedRoles={[ROLES.ADMIN, ROLES.COORDINATOR]} />} />
        <Route path="/planificacion-estrategica/:year" element={<PrivateRoute element={<StrategicPlanningDashboardPage />} allowedRoles={[ROLES.ADMIN, ROLES.COORDINATOR]} />} />
        <Route path="/planificacion/operativa/:id?" element={<PrivateRoute element={<OperationalPlanningDashboardPage />} allowedRoles={[ROLES.ADMIN, ROLES.COORDINATOR]} />} />
        <Route path="/dashboard" element={<PrivateRoute element={<APIsDashboardPage />} allowedRoles={[ROLES.ADMIN, ROLES.COORDINATOR]} />} />
        <Route path="/reportes/crear/:nombre/:id" element={<PrivateRoute element={<ReportEditor />} allowedRoles={[ROLES.ADMIN, ROLES.COORDINATOR]} />} />
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
                    <ConfirmProvider>
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
                                lg: getDrawerClosedWidth(), 
                              }, 
                              maxWidth: 2000,
                            }}> 
                            <Box sx={{
                              width: '100%',
                              px: {xs: 0, lg: 1},
                            }}>
                              {/* BURBUJA DEL REPORTE */}
                              <ReportBubble onClick={() => setModalOpen(true)} />
                              <ReportModal open={modalOpen} onClose={() => setModalOpen(false)} />
                              <AppContent />
                            </Box>
                          </Box>
                        </Box>
                      </ReportProvider>
                    </ConfirmProvider>
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
