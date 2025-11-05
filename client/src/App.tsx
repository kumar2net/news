import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Fab,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import { Outlet } from "react-router-dom";
import ModeToggle from "./components/ModeToggle";

export default function App() {
  return (
    <Box>
      <AppBar
        color="default"
        position="fixed"
        enableColorOnDark
        sx={{ bgcolor: "background.paper" }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            kumar2net
          </Typography>
          <ModeToggle />
        </Toolbar>
      </AppBar>

      <Toolbar />
      <Container sx={{ py: 3 }}>
        <React.Suspense
          fallback={
            <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          }
        >
          <Outlet />
        </React.Suspense>
      </Container>

      <Fab color="primary" sx={{ position: "fixed", bottom: 80, right: 24 }}>
        <AddIcon />
      </Fab>
    </Box>
  );
}
