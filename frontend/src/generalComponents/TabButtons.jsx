import React, { useEffect, useRef, useState } from "react";
import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const TabPanel = ({ children, value, index }) => (
  <div
    role="tabpanel"
    id={`tab-panel-${index}`}
    aria-labelledby={`tab-${index}`}
    style={{
      height: "100%",
      width: '100%',
      display: value === index ? "flex" : "none",
      flexDirection: "column",
    }}
  >
    {children}
  </div>
);

export const TabButtons = ({ labels, paramsLabels, children, onTabsHeightChange, onChange, canChangeTab }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
  const [searchParams, setSearchParams] = useSearchParams();

  const paramValue = searchParams.get("tab") ?? paramsLabels[0];

  const initialValue = Math.max(0, paramsLabels.indexOf(paramValue));
  const [value, setValue] = useState(initialValue);
  const [mountedTabs, setMountedTabs] = useState(new Set([initialValue]));

  const [nextTab, setNextTab] = useState(null);

  const tabsRef = useRef(null);
  const variant = isLaptop ? "fullWidth" : "scrollable";

  useEffect(() => {
    const paramValue = searchParams.get("tab");
    if (paramValue) {
      const decodedParam = decodeURIComponent(paramValue);
      const newValue = paramsLabels.indexOf(decodedParam);
      if (newValue >= 0 && newValue !== value) {
        handleTabChange(newValue);
      }
    }
  }, [searchParams]);

  // Calcula la altura del Tabs
  useEffect(() => {
    if (tabsRef.current) {
      const height = tabsRef.current.getBoundingClientRect().height;
      onTabsHeightChange?.(height);
    }
  }, [labels, onTabsHeightChange]);

  const handleTabChange = (_event, newValue) => {
    // ✅ Evitar cambiar a tab si canChangeTab devuelve false
    if (typeof canChangeTab === "function" && !canChangeTab(newValue)) {
      return; // no hacer nada
    }

    if (!mountedTabs.has(newValue)) {
      setMountedTabs(prev => new Set([...prev, newValue]));
      setNextTab(newValue);
    } else {
      setValue(newValue);
    }

    setSearchParams({ tab: paramsLabels[newValue] });
    onTabsHeightChange?.(tabsRef.current?.getBoundingClientRect().height ?? 0);
    onChange?.(paramsLabels[newValue]);
  };

  useEffect(() => {
    if (nextTab !== null && mountedTabs.has(nextTab)) {
      setValue(nextTab);
      setNextTab(null);
    }
  }, [nextTab, mountedTabs]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Tabs
        ref={tabsRef}
        value={value}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="inherit"
        variant={variant}
        scrollButtons={variant === "scrollable" ? "auto" : undefined}
        allowScrollButtonsMobile
        aria-label="tabs"
        sx={{
          "& .MuiTab-root": {
            fontSize: {
              xs: "0.7rem",
              sm: "0.7rem",
              md: "0.7rem",
              lg: "0.8rem", 
              xl: "1.1rem",
            },
          },
          width: {
              xs: '280px',
              sm: '100%'
            },
        }}
      >
        {labels.map((label, idx) => (
          <Tab 
            key={idx} 
            label={label} 
            id={`tab-${idx}`} 
            aria-controls={`tab-panel-${idx}`} 
          />
          
        ))}
      </Tabs>

      {children.map((child, idx) =>
        mountedTabs.has(idx) ? (
          <TabPanel key={idx} value={value} index={idx}>
            {child}
          </TabPanel>
        ) : null
      )}
    </Box>
  );
};
