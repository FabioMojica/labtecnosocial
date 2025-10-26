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

const StrategicPlanningDashboardPage = () => {
  const { year } = useParams();
  console.log(year)
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
  const navigate = useNavigate();

  useEffect(() => {
    if (!year) {
      setSelectedYear(currentYear);
      navigate(`/planificacion-estrategica/${currentYear}`, { replace: true });
    } else {
      setSelectedYear(parseInt(year, 10));
    }
  }, [year, navigate]);

  // console.log("xsssssss", year);



  useEffect(() => {
    if (user?.role === "coordinator") {
      setSelectedView("Documento");
    }
  }, [user]);

  // ✅ Obtener todos los planes
  useEffect(() => {
    const fetchAllPlans = async () => {
      try {
        const res = await callEndpoint(getAllStrategicPlansApi());
        setAllPlans(res);
      } catch (error) {
        notify("Error obteniendo planes estratégicos. Inténtalo de nuevo más tarde.", "error");
      }
    };
    fetchAllPlans();
  }, []);

  // ✅ Obtener plan por año
  useEffect(() => {
    const yearToFetch = year ? parseInt(year) : currentYear;

    const fetchPlan = async () => {
      try {
        setShowColumnsView(false);
        setPlanData(null);

        const res = await callEndpoint(getStrategicPlanByYearApi(yearToFetch));
        setPlanData(normalizePlanData(res));
        setShowColumnsView(true);
      } catch (error) {
        console.log("Error fetching plan:", error);
        if (error.response && error.response.status === 404) {
          setShowColumnsView(false);
          setPlanData(null);
        } else {
          notify(`Error obteniendo el plan estratégico del año ${yearToFetch}.`, "error");
        }
      }
    };

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

  if(loading) {
    return <FullScreenProgress text="Obteniendo el plan estratégico" />;
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
          gap: 1,
          width: '100%',
          mb: 1
        }}
      >
        <Typography variant="h4" sx={{
          fontSize: {
            xs: '1.5rem',
            sm: '2rem'
          }
        }}>Planificación Estratégica</Typography>

        <Box sx={{
          display: 'flex',
          flexDirection: {
            xs: 'column',
            sm: 'row'
          },
          gap: 2,

        }}>
          <SelectYear
            selectedYear={selectedYear}
            onChange={(newYear) => {
              setIsChildDirty(false);
              setSelectedYear(newYear);
              setPlanData(null);
              setShowColumnsView(false);
              navigate(`/planificacion-estrategica/${newYear}`, { replace: true });
            }}
          />

          {user?.role === "admin" && (
            <FormControl sx={{ minWidth: 150 }} variant="outlined">
              <InputLabel>Seleccionar Vista</InputLabel>
              <Select value={selectedView} onChange={handleViewChange} label="Seleccionar Vista">
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
              <Tooltip title={`Borrar el plan estratégico del año ${selectedYear}`}>
                <IconButton
                  onClick={() => setDeleteDialogOpen(true)}
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

      {!showColumnsView && (
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
