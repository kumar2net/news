import { extendTheme } from "@mui/material/styles";

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#6750A4" },
        secondary: { main: "#625B71" },
        background: { default: "#FFFBFE", paper: "#FEF7FF" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#D0BCFF" },
        secondary: { main: "#CCC2DC" },
        background: { default: "#1C1B1F", paper: "#1C1B1F" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h2: { fontWeight: 700 },
    body1: { lineHeight: 1.6 },
  },
  components: {
    MuiButton: { defaultProps: { variant: "contained" } },
    MuiPaper: { defaultProps: { elevation: 1 } },
  },
});

export default theme;
