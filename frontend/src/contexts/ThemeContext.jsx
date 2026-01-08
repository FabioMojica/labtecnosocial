import { createContext, useState, useContext } from "react";
import { ThemeProvider, createTheme, } from "@mui/material/styles";


const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',

      principal: '#FFFFFF',


      backgroundHeader: '#1F7D53',
      backgroundNavBar: '#1F7D53',

      backgroundBox: '#FFFFFF',
      boxShadowBox: '0 2px 8px rgba(39, 24, 24, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)',

      buttonsBackgroundMain: '#6200EE',
      buttonsBackgroundSecondary: '',
      buttonsBackgroundTertiary: '',

      backgroundModal: '#1F1F1F',

      principalText: '#FFFFFF',
      secondaryText: '#5f5f5fff',
    },
    secondary: { main: '#B3FFD6' },
    background: {
      default: '#FFFFFF',
      paper: '#E5E5E5'
    },
  },
  zIndex: {
    modal: 70000,        
    tooltip: 60000,       
     
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          "&.Mui-disabled": {

            opacity: 0.6,
          },
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#B5B5B5',

      principal: '#FFFFFF',

      backgroundHeader: '#1F1F1F',
      backgroundBox: '#1F1F1F',
      boxShadowBox: '0 2px 8px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.25)',

      buttonsBackgroundMain: '#6200EE',
      buttonsBackgroundSecondary: '#2A2A2A',
      buttonsBackgroundTertiary: '#00C8A8',

      backgroundModal: '#1F1F1F',

      principalText: '#FFFFFF',
      secondaryText: '#B5B5B5',
    },
    secondary: { main: '#020202ff' },
    background: { default: '#121212', paper: '#2D2D2D' },
  },
  zIndex: {
    modal: 70000,        
    tooltip: 60000,       
    
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          "&.Mui-disabled": {
            opacity: 0.6,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          '&.Mui-focused': {
            color: '#B5B5B5',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& input:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 1000px inset`,
            WebkitTextFillColor: 'currentColor',
          },
        },
      },
    }
  }

});

const ThemeContext = createContext({
  isDarkMode: true,
  toggleTheme: () => { },
  theme: lightTheme,
});

export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("isDarkMode");
    return saved ? JSON.parse(saved) : true;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("isDarkMode", JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme: isDarkMode ? darkTheme : lightTheme }}>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
