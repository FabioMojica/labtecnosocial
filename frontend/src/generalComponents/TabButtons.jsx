import React, { useEffect, useRef, useState } from "react";
import { Box, Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";

const TabPanel = ({ children, value, index }) => (
  <div
    role="tabpanel"
    id={`tab-panel-${index}`}
    aria-labelledby={`tab-${index}`}
    style={{
      height: "100%",
      width: "100%",
      display: value === index ? "flex" : "none",
      flexDirection: "column",
    }}
  >
    {children}
  </div>
);

export const TabButtons = ({
  labels,
  children,
  onTabsHeightChange,
  canChangeTab,
  onChange,
  sx,
}) => {
  const theme = useTheme();
  const isLaptop = useMediaQuery(theme.breakpoints.up("md"));

  const [value, setValue] = useState(0);
  const [mountedTabs, setMountedTabs] = useState(new Set([0]));
  const [nextTab, setNextTab] = useState(null);

  const tabsRef = useRef(null);
  const variant = isLaptop ? "fullWidth" : "scrollable";

  // calcular altura
  useEffect(() => {
    if (tabsRef.current) {
      onTabsHeightChange?.(
        tabsRef.current.getBoundingClientRect().height
      );
    }
  }, [labels, onTabsHeightChange]);

  const handleTabChange = (_event, newValue) => {
    if (typeof canChangeTab === "function" && !canChangeTab(newValue)) {
      return;
    }

    if (!mountedTabs.has(newValue)) {
      setMountedTabs(prev => new Set([...prev, newValue]));
      setNextTab(newValue);
    } else {
      setValue(newValue);
    }

    onChange?.(newValue);
  };

  useEffect(() => {
    if (nextTab !== null && mountedTabs.has(nextTab)) {
      setValue(nextTab);
      setNextTab(null);
    }
  }, [nextTab, mountedTabs]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...sx,
      }}
    >
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
            xs: "100vw",
            sm: "100%",
          },
        }}
      >
        {labels.map((label, idx) => (
          <Tab
            key={idx}
            label={label}
            disabled={
              typeof canChangeTab === "function" &&
              !canChangeTab(idx)
            }
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
 