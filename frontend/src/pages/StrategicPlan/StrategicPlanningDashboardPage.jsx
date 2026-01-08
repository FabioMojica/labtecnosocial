import { useState, useEffect } from "react";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Container,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteStrategicPlanDialog from "./components/DeleteStrategicPlanDialog";

import StrategicPlanningColumnsView from "./StrategicPlanningColumnsView";
import StrategicPlanningTreeView from "./StrategicPlanningTreeView";
import { getAllStrategicPlansApi, getStrategicPlanByYearApi } from "../../api/strategicPlan";
import { useNotification } from "../../contexts";
import { useAuth } from "../../contexts";
import { normalizePlanData } from "./utils/normalizePlanData";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchAndLoad } from "../../hooks/useFetchAndLoad.js";
import { SelectYear } from "./components/SelectYear";
import { NoResultsScreen } from "../../generalComponents/NoResultsScreen";
import { FullScreenProgress } from "../../generalComponents/FullScreenProgress.jsx";
import { ErrorScreen } from "../../generalComponents/ErrorScreen.jsx";

const StrategicPlanningDashboardPage = () => {
  const { year } = useParams();
  const [selectedYear, setSelectedYear] = useState(null);
  const { user } = useAuth();
  const { loading, callEndpoint } = useFetchAndLoad();
  const { notify } = useNotification();
  const [selectedView, setSelectedView] = useState("Columna");
  const [allPlans, setAllPlans] = useState([]);
  const [showColumnsView, setShowColumnsView] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [isChildDirty, setIsChildDirty] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [errorPlan, setErrorPlan] = useState(false);
  const [errorPlans, setErrorPlans] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isChildDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isChildDirty]);

  useEffect(() => {
    if (!year) {
      setSelectedYear(currentYear);
      navigate(`/planificacion-estrategica/${currentYear}`, { replace: true });
    } else {
      setSelectedYear(parseInt(year, 10));
    }
  }, [year, navigate]);

  useEffect(() => {
    if (user?.role === "coordinator") {
      setSelectedView("Documento");
    }
  }, [user]);

  const fetchAllPlans = async () => {
    try {
      setErrorPlans(false);
      const res = await callEndpoint(getAllStrategicPlansApi());
      setAllPlans(res);
    } catch (error) {
      setErrorPlans(true);
    }
  };

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const fetchPlan = async () => {
    const yearToFetch = year ? parseInt(year) : currentYear;
    try {
      setErrorPlan(false);
      setLoadingPlan(true);
      setShowColumnsView(false);
      setPlanData(null);

      const res = await callEndpoint(getStrategicPlanByYearApi(yearToFetch));
      setPlanData(normalizePlanData(res));
      setShowColumnsView(true);
    } catch (error) {
      if (error.message?.includes("No se encontró plan estratégico")) {
        setPlanData(null);
        setShowColumnsView(false);
      } else {
        setErrorPlan(true);
      }
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [year, selectedView]);

  const onChangeToColumnsView = () => {
    const emptyPlan = {
      mission: "",
      objectives: [],
    };
    setPlanData(emptyPlan);
    setShowColumnsView(true);
    setSelectedView("Columna");
  };

  const handleViewChange = (event) => {
    if (user?.role !== "admin") return;

    setIsChildDirty(false);
    setSelectedView(event.target.value);
  };

  if (loading) {
    return <FullScreenProgress text={ `Obteniendo el plan estratégico del año ${year ? parseInt(year) : currentYear}`} />;
  }

  if (errorPlan) {
    return <ErrorScreen message={`Ocurrió un error al obtener el plan estratégico del año ${year ? parseInt(year) : currentYear}`} buttonText="Intentar de nuevo" onButtonClick={() => fetchPlan()} />
  }

  if (errorPlans) {
    return <ErrorScreen message="Ocurrió un error al obtener los planes estratégicos" buttonText="Intentar de nuevo" onButtonClick={() => fetchAllPlans()} />
  }

  return (
    <Box maxWidth sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            sm: 'row',
            xs: 'column'
          },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          width: '100%',
          mb: 1
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            fontSize: {
              xs: '1.5rem',
              sm: '2rem'
            },
            width: { xs: '100%', sm: 'auto' },
            textAlign: 'center',
          }}
        >
          Planes Estratégicos{" "}
          <Typography
            component="span"
            color="text.secondary"
            fontWeight="normal"
          >
            ({allPlans?.length})
          </Typography>
        </Typography>


        <Box sx={{
          display: 'flex',
          gap: 2,
        }}>
          <SelectYear
            selectedYear={selectedYear}
            disabled={isChildDirty}
            availableYears={allPlans.map(p => p.year)}
            onChange={(newYear) => {
              setIsChildDirty(false);
              setSelectedYear(newYear);
              setPlanData(null);
              setShowColumnsView(false);
              navigate(`/planificacion-estrategica/${newYear}`, { replace: true });
            }}
          />

          {user?.role === "admin" && planData?.id && (
            <FormControl sx={{ minWidth: 150 }} variant="outlined" size="small">
              <InputLabel>Seleccionar Vista</InputLabel>
              <Select value={selectedView} onChange={handleViewChange} label="Seleccionar Vista" disabled={isChildDirty}>
                <MenuItem value="Columna">Columna</MenuItem>
                <MenuItem value="Documento">Documento</MenuItem>
              </Select>
            </FormControl>
          )}

          {planData?.id && selectedView === "Columna" && user.role === "admin" && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Tooltip title={`Eliminar el plan estratégico del año ${selectedYear}`}>
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
                  color="error"
                  disabled={isChildDirty}
                  sx={{
                    boxShadow: 3,
                    width: 40,
                    height: 40,
                  }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      <Divider />

      {(!showColumnsView && !loadingPlan && !planData) && (
        <>
          <NoResultsScreen
            message="Año sin plan estratégico registrado"
            buttonText={
              user?.role === "admin" && selectedView === "Columna"
                ? "Crear Plan Estratégico"
                : null
            }
            onButtonClick={
              user?.role === "admin" && selectedView === "Columna"
                ? onChangeToColumnsView
                : undefined
            }
            sx={{ height: "60vh" }}
          />
        </>
      )}

      {showColumnsView && selectedView && (
        <Box sx={{ p: 0 }}>
          {selectedView === "Columna" && (
            <StrategicPlanningColumnsView
              data={planData}
              year={selectedYear}
              onDirtyChange={setIsChildDirty}
              onPlanSaved={(newPlan) => {
                if (!newPlan) {
                  setPlanData(null);
                  setShowColumnsView(false);
                  setAllPlans((prev) => prev.filter((p) => p.year !== selectedYear));
                  return;
                }
                setPlanData(newPlan);
              }}
            />
          )}
          {selectedView === "Documento" && (
            <StrategicPlanningTreeView data={planData} year={selectedYear} />
          )}
        </Box>
      )}

      <DeleteStrategicPlanDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        year={selectedYear}
        onDeleted={() => {
          setPlanData(null);
          setShowColumnsView(false);
          setAllPlans((prev) => prev.filter((p) => p.year !== parseInt(year || currentYear, 10)));
        }}
      />
    </Box>
  );
};

export default StrategicPlanningDashboardPage;
