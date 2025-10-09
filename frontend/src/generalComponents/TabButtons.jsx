import React, { useEffect, useRef, useState } from "react";
import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import { useSearchParams } from "react-router-dom";

const TabPanel = ({ children, value, index }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tab-panel-${index}`}
    aria-labelledby={`tab-${index}`}
    style={{ height: "100%" }}
  >
    {value === index && (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </Box>
    )}
  </div>
);

export const TabButtons = ({ labels, paramsLabels, children, onTabsHeightChange }) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
  const [searchParams, setSearchParams] = useSearchParams();

  const paramValue = searchParams.get("tab") ?? paramsLabels[0];
  const initialValue = paramsLabels.indexOf(paramValue);
  const [value, setValue] = useState(initialValue >= 0 ? initialValue : 0);

  const tabsRef = useRef(null);
  const variant = isLaptop ? "fullWidth" : "scrollable";

  useEffect(() => {
    const paramValue = searchParams.get("tab");
    if (paramValue) {
      const decodedParam = decodeURIComponent(paramValue);
      const newValue = paramsLabels.indexOf(decodedParam);
      if (newValue >= 0 && newValue !== value) {
        setValue(newValue);
      }
    }
  }, [searchParams, paramsLabels, value]);



  useEffect(() => {
    if (tabsRef.current) {
      const height = tabsRef.current.getBoundingClientRect().height;
      onTabsHeightChange?.(height);
    }
  }, [labels, onTabsHeightChange]);


  const handleChange = (_event, newValue) => {
    setValue(newValue);
    setSearchParams({ tab: paramsLabels[newValue] });
  };


  return (
    <Box>
      <Tabs
        ref={tabsRef}
        value={value}
        onChange={handleChange}
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
        }}
      >
        {labels.map((label, idx) => (
          <Tab key={idx} label={label} id={`tab-${idx}`} aria-controls={`tab-panel-${idx}`} />
        ))}
      </Tabs>

      {children.map((child, idx) => (
        <TabPanel key={idx} value={value} index={idx}>
          {child}
        </TabPanel>
      ))}
    </Box>
  );
};
