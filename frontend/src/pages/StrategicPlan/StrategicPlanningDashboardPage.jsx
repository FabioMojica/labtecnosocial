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
import { useAuth, useNotification } from "../../contexts";
import { normalizePlanData } from "./utils/normalizePlanData";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchAndLoad } from "../../hooks/useFetchAndLoad.js";
import { SelectYear } from "./components/SelectYear";
import { NoResultsScreen } from "../../generalComponents/NoResultsScreen";
import { FullScreenProgress } from "../../generalComponents/FullScreenProgress.jsx";
import { ErrorScreen } from "../../generalComponents/ErrorScreen.jsx";
import { roleConfig } from "../../utils/index.js";

const StrategicPlanningDashboardPage = () => {
  const { year } = useParams();
  const [selectedYear, setSelectedYear] = useState(null);
  const { user } = useAuth();
  console.log("user", user)
  const { loading, callEndpoint } = useFetchAndLoad();
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
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState(false);
  const [isFetchingPlan, setIsFetchingPlan] = useState(true);
  const [hasFetchedPlan, setHasFetchedPlan] = useState(false);
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
    if (user?.role === roleConfig.coordinator.value) {
      setSelectedView("Documento");
    }
  }, [user]);

  useEffect(() => {
    setIsCreatingNewPlan(false);
  }, [year]);


  const fetchAllPlans = async () => {
    try {
      setErrorPlans(false);
      const res = await callEndpoint(getAllStrategicPlansApi());
      setAllPlans(res);
    } catch (error) {
      notify(error.message, "error");
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
      setIsFetchingPlan(true);
      setShowColumnsView(false);
      setHasFetchedPlan(false);


      const res = await callEndpoint(getStrategicPlanByYearApi(yearToFetch));

      console.log("fesp", res)
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
      setIsFetchingPlan(false);
      setHasFetchedPlan(true);
    }
  };

  const isLoadingPlan = isFetchingPlan || loading;

  useEffect(() => {
    if (!isCreatingNewPlan) {
      fetchPlan();
    }
  }, [year, selectedView]);

  const onChangeToColumnsView = () => {
    setIsCreatingNewPlan(true);
    const emptyPlan = {
      mission: "",
      objectives: [],
    };
    setPlanData(emptyPlan);
    setShowColumnsView(true);
    setSelectedView("Columna");
  };

  const handleViewChange = (event) => {
  if (user?.role !== roleConfig.admin.value || user?.role !== roleConfig.superAdmin.value) return;
    setIsChildDirty(false);
    setSelectedView(event.target.value);
  };

  if (isLoadingPlan) {
    return <FullScreenProgress text={`Obteniendo el plan estratégico del año ${year ? parseInt(year) : currentYear}`} />;
  }

  if (errorPlan) {
    return <ErrorScreen message={`Ocurrió un error al obtener el plan estratégico del año ${year ? parseInt(year) : currentYear}`} buttonText="Intentar de nuevo" onButtonClick={() => fetchPlan()} />
  }

  if (errorPlans) {
    return <ErrorScreen message="Ocurrió un error al obtener los planes estratégicos" buttonText="Intentar de nuevo" onButtonClick={() => fetchAllPlans()} />
  }

  return (
    <Box sx={{mt: { xs: 2, lg: 0}}} maxWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column', }}>
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
            mb: 1,
            px: 1,
            pr: 2,
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
                if (newYear === selectedYear) return;
                setIsCreatingNewPlan(false);
                setIsChildDirty(false);
                setSelectedYear(newYear);
                setPlanData(null);
                setShowColumnsView(false);
                navigate(`/planificacion-estrategica/${newYear}`, { replace: true });
              }}
            />

            {(user?.role === roleConfig.admin.value || user?.role === roleConfig.superAdmin.value) && planData?.id && (
              <FormControl sx={{ minWidth: 150 }} variant="outlined" size="small">
                <InputLabel>Seleccionar Vista</InputLabel>
                <Select value={selectedView} onChange={handleViewChange} label="Seleccionar Vista" disabled={isChildDirty}>
                  <MenuItem value="Columna">Columna</MenuItem>
                  <MenuItem value="Documento">Documento</MenuItem>
                </Select>
              </FormControl>
            )} 

            {planData?.id && selectedView === "Columna" && (user.role === roleConfig.superAdmin.value) && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Tooltip title={`Eliminar el plan estratégico del año ${selectedYear}`}>
                  <span>
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
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

      </Box>

      {!planData && hasFetchedPlan && (
        <>
          <Divider sx={{ mr: 1, ml: { xs: 1 } }} /> 
          <NoResultsScreen
            message='Año sin plan estratégico registrado'
            buttonText={
              (user?.role === roleConfig.admin.value || user?.role == roleConfig.superAdmin.value)
                ? "Crear Plan Estratégico"
                : null 
            }
            onButtonClick={
              (user?.role === roleConfig.admin.value || user?.role == roleConfig.superAdmin.value)
                ? onChangeToColumnsView
                : undefined
            }
            sx={{ height: "80vh" }}
            buttonSx={{
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
              "&.Mui-disabled": {
                backgroundColor: "action.disabledBackground",
                color: "action.disabled",
              },
            }} />
        </>
      )}

      {showColumnsView && selectedView && (
        <Box>
          {selectedView === "Columna" && (
            <StrategicPlanningColumnsView
              data={planData}
              year={selectedYear}
              onDirtyChange={setIsChildDirty}
              onPlanSaved={(newPlan) => {
                setIsCreatingNewPlan(false);
                if (!newPlan) {
                  setPlanData(null);
                  setShowColumnsView(false);
                  setAllPlans((prev) => prev.filter((p) => p.year !== selectedYear));
                  return;
                }
                setPlanData(newPlan);
                setAllPlans((prev) => {
                  const exists = prev.some(p => p.year === newPlan.year);
                  if (exists) return prev;
                  return [...prev, { year: newPlan.year }];
                }); 
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
