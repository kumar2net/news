import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Fab,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import ArticleIcon from "@mui/icons-material/Article";
import PersonIcon from "@mui/icons-material/Person";
import { Outlet, Link, useLocation } from "react-router-dom";
import ModeToggle from "./components/ModeToggle";

export default function App() {
  const location = useLocation();
  const navValue = location.pathname.startsWith("/blog")
    ? "blog"
    : location.pathname.startsWith("/me")
      ? "me"
      : "home";

  return (
    <Box sx={{ pb: { xs: 7, md: 0 } }}>
      <AppBar color="surface" position="fixed" enableColorOnDark>
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

      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "block", md: "none" },
        }}
      >
        <BottomNavigation value={navValue} showLabels>
          <BottomNavigationAction
            label="Home"
            value="home"
            icon={<HomeIcon />}
            component={Link}
            to="/"
          />
          <BottomNavigationAction
            label="Blog"
            value="blog"
            icon={<ArticleIcon />}
            component={Link}
            to="/blog"
          />
          <BottomNavigationAction
            label="Me"
            value="me"
            icon={<PersonIcon />}
            component={Link}
            to="/me"
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
