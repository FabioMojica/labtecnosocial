import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Chip,
  Divider,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectBudgetRequestsApi } from "../../../api";
import { useAuth, useHeaderHeight, useNotification } from "../../../contexts";
import { FullScreenProgress } from "../../../generalComponents";
import { useFetchAndLoad } from "../../../hooks";
import { formatDateParts } from "../../../utils";
import { BudgetRequestDetailsDialog } from "./BudgetRequestDetailsDialog";
import { CreateBudgetRequestDialog } from "./CreateBudgetRequestDialog";

const statusColorMap = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export const ProjectBudgetRequestsPanel = ({ project, panelHeight = 0 }) => {
  const { headerHeight } = useHeaderHeight();
  const { isAdmin, isSuperAdmin } = useAuth();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const { loading, callEndpoint } = useFetchAndLoad();
  const [requestsData, setRequestsData] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const title = isSuperAdmin ? "Solicitudes al presupuesto" : "Tus solicitudes al presupuesto";
  const canCreateRequest = isAdmin;

  const budgetFormatted = useMemo(() => {
    if (project?.budget_amount === null || project?.budget_amount === undefined || project?.budget_amount === "") {
      return "No definido";
    }

    return `Bs ${Number(project.budget_amount).toLocaleString("es-BO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }, [project?.budget_amount]);

  const fetchBudgetRequests = async () => {
    if (!project?.id) return;

    try {
      const response = await callEndpoint(getProjectBudgetRequestsApi(project.id));
      setRequestsData(response);
    } catch (error) {
      notify(error.message, "error");
    }
  };

  useEffect(() => {
    if ((isAdmin || isSuperAdmin) && project?.id) {
      fetchBudgetRequests();
    }
  }, [project?.id, isAdmin, isSuperAdmin]);

  if (loading && !requestsData) {
    return <FullScreenProgress text="Obteniendo solicitudes al presupuesto" />;
  }

  const requests = requestsData?.requests || [];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: `calc(100vh - ${headerHeight}px - ${panelHeight}px)`,
        p: 1,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona las solicitudes asociadas al presupuesto del proyecto.
            </Typography>
          </Box>

          {canCreateRequest && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                if (project?.budget_amount === null || project?.budget_amount === undefined || project?.budget_amount === "") {
                  notify("Este proyecto no tiene un presupuesto definido para recibir solicitudes.", "warning");
                  return;
                }
                setOpenCreateDialog(true);
              }}
            >
              Nueva solicitud
            </Button>
          )}
        </Stack>

        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Presupuesto del proyecto
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {budgetFormatted}
          </Typography>
        </Paper>

        <Divider />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Fecha</TableCell>
                {isSuperAdmin && <TableCell sx={{ fontWeight: "bold" }}>Solicitante</TableCell>}
                <TableCell sx={{ fontWeight: "bold" }} align="right">Monto</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">Solicitud</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => {
                  const { date, time } = formatDateParts(request.created_at);
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Typography variant="body2">{date}</Typography>
                        <Typography variant="caption" color="text.secondary">{time}</Typography>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          {request.requested_by ? (
                            <Link
                              component="button"
                              underline="hover"
                              color="inherit"
                              fontWeight="bold"
                              onClick={() => navigate(`/usuario/${encodeURIComponent(request.requested_by.email)}`)}
                            >
                              {request.requested_by.email}
                            </Link>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No disponible
                            </Typography>
                          )}
                        </TableCell>
                      )}
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        Bs {Number(request.total_amount || 0).toLocaleString("es-BO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={statusColorMap[request.status] || "default"}
                          label={request.status_label}
                          sx={{ fontWeight: "bold" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityOutlinedIcon />}
                          onClick={() => setSelectedRequest(request)}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={isSuperAdmin ? 5 : 4}>
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      {isSuperAdmin
                        ? "Aún no existen solicitudes registradas para el presupuesto de este proyecto."
                        : "Aún no has realizado solicitudes al presupuesto de este proyecto."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <CreateBudgetRequestDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        projectId={project?.id}
        projectBudgetAmount={Number(project?.budget_amount)}
        onCreated={(createdRequest) => {
          setRequestsData((prev) => ({
            ...(prev || {}),
            project_id: project?.id,
            project_name: project?.name,
            budget_amount: project?.budget_amount ?? null,
            requests: [createdRequest, ...(prev?.requests || [])],
          }));
        }}
      />

      <BudgetRequestDetailsDialog
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        isSuperAdmin={isSuperAdmin}
        onOpenUserProfile={(user) => {
          setSelectedRequest(null);
          navigate(`/usuario/${encodeURIComponent(user.email)}`);
        }}
      />
    </Box>
  );
};

