"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";

/**
 * Aligns MUI defaults with Tailwind/@theme tokens in globals.css so MUI
 * components match the existing WealthTracker look.
 */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#000000", contrastText: "#ffffff" },
    secondary: { main: "#006c49", contrastText: "#ffffff" },
    error: { main: "#ba1a1a", contrastText: "#ffffff" },
    background: {
      default: "#f7f9fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#191c1e",
      secondary: "#45464d",
    },
    divider: "#c6c6cd",
    action: {
      active: "#006c49",
    },
  },
  typography: {
    fontFamily:
      'var(--font-inter), "Inter", ui-sans-serif, system-ui, sans-serif',
    button: {
      fontWeight: 600,
      letterSpacing: "0.05em",
      textTransform: "uppercase",
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: "0.125rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600,
          fontSize: "0.75rem",
          lineHeight: "1rem",
        },
        sizeMedium: {
          minHeight: 40,
          paddingLeft: "1rem",
          paddingRight: "1rem",
        },
        sizeSmall: {
          minHeight: 36,
          paddingLeft: "0.75rem",
          paddingRight: "0.75rem",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "0.125rem",
            backgroundColor: "#ffffff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": {
            borderColor: "#c6c6cd",
          },
          "&:hover fieldset": {
            borderColor: "#76777d",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#006c49",
            borderWidth: "1px",
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: "#006c49",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "9999px",
          height: 8,
          backgroundColor: "#e0e3e5",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          letterSpacing: "0.05em",
          fontSize: "0.75rem",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

export function MuiAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui" }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
}
