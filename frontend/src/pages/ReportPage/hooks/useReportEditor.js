import { useMemo, useRef, useState } from "react";
import { useNotification } from "../../contexts";

export const useReportEditor = (initialId, isNew) => {
  const { notify } = useNotification();
  const [editedReport, setEditedReport] = useState({ title: "Reporte sin título", elements: {}, elementsOrder: [] });
  const originalReportRef = useRef(structuredClone(editedReport));
  const [history, setHistory] = useState([structuredClone(editedReport)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [currentReportId, setCurrentReportId] = useState(initialId);
  const [isCreateNewReport, setIsCreateNewReport] = useState(isNew);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(editedReport) !== JSON.stringify(originalReportRef.current);
  }, [editedReport]);

  const fetchReport = async () => { /* fetch + format + set snapshot */ };
  const saveReport = async () => { /* create/update + snapshot + history */ };
  const insertElementAfter = (afterId, element) => { /* lógica de inserción */ };
  const removeElement = (id) => { /* lógica de borrado */ };
  const pushToHistory = (snapshot) => { /* lógica undo/redo */ };

  return {
    editedReport,
    setEditedReport,
    originalReportRef,
    currentReportId,
    setCurrentReportId,
    isCreateNewReport,
    setIsCreateNewReport,
    isDirty,
    history,
    historyIndex,
    pushToHistory,
    insertElementAfter,
    removeElement,
    fetchReport,
    saveReport,
    fetching,
    saving,
  };
};
