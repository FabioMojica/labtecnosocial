import { Box, CssBaseline, Toolbar, useTheme } from '@mui/material';
import { SnackbarProvider } from "notistack";

import { AuthProvider, CustomThemeProvider, HeaderHeightProvider, SoundProvider, useAuth } from './contexts';
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


import { FullScreenProgress, Header, PrivateRoute } from './generalComponents';
import { getDrawerClosedWidth } from './utils';
import StrategicPlanningDashboardPage from './pages/StrategicPlan/StrategicPlanningDashboardPage';
import OperationalPlanningDashboardPage from './pages/OperationalPlan/OperationalPlanningDashboardPage';
import { ConfirmProvider } from 'material-ui-confirm';
import { APIsDashboardPage } from './pages/APIsDashboardPage/ApisDashboardPage';
import { ReportProvider } from './contexts/ReportContext';
import { ReportBubble } from './generalComponents/ReportBubble';
import { ReportModal } from './generalComponents/ReportModal';
import { useState } from 'react';
import { ReportEditor } from './pages/Reports/ReportEditor';

export const ROLES = {
  ADMIN: "admin",
  COORDINATOR: "coordinator",
};

export const PublicRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullScreenProgress />;

  if (isAuthenticated) return <Navigate to="/inicio" replace />;

  return <>{element}</>;
};


const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  useAuthEffects();

  if (loading) return <FullScreenProgress />;

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
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <CustomThemeProvider>
      <SoundProvider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <BrowserRouter>
            <AuthProvider>
              <HeaderHeightProvider>
                <ConfirmProvider>
                  <ReportProvider>
                    <CssBaseline />
                    <Box sx={{
                      flexGrow: 1,
                      padding: 1,
                      minHeight: '100vh',
                      pl: {
                        xs: getDrawerClosedWidth(theme, 'xs'),
                        sm: getDrawerClosedWidth(theme, 'sm'),
                      },
                      maxWidth: 1600,
                    }}>
                       {/* BURBUJA DEL REPORTE */}
                      <ReportBubble onClick={() => setModalOpen(true)} />
                      <ReportModal open={modalOpen} onClose={() => setModalOpen(false)} />
                      <AppContent />
                    </Box>
                  </ReportProvider>
                </ConfirmProvider>
              </HeaderHeightProvider>
            </AuthProvider>
          </BrowserRouter>
        </SnackbarProvider>
      </SoundProvider>
    </CustomThemeProvider>
  );
}

export default App;
