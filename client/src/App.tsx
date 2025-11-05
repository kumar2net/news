import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import OutboundIcon from "@mui/icons-material/Outbound";
import SendIcon from "@mui/icons-material/Send";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimelineIcon from "@mui/icons-material/Timeline";
import KeyboardCommandKeyIcon from "@mui/icons-material/KeyboardCommandKey";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
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
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [speedDialOpen, setSpeedDialOpen] = React.useState(false);

  return (
    <Box sx={{ pb: { xs: 7, md: 0 } }}>
      <AppBar
        color="default"
        position="fixed"
        enableColorOnDark
        sx={{ bgcolor: "background.paper" }}
      >
        <Toolbar>
          <Tooltip title="Command palette">
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setPaletteOpen(true)}
            >
              <KeyboardCommandKeyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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

      <SpeedDial
        ariaLabel="Quick actions"
        icon={<RocketLaunchIcon />}
        FabProps={{ color: "primary" }}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
        sx={{ position: "fixed", bottom: 88, right: 24 }}
      >
        <SpeedDialAction
          icon={<SendIcon />}
          tooltipTitle="Share briefing"
          onClick={() => setSpeedDialOpen(false)}
        />
        <SpeedDialAction
          icon={<AccessTimeIcon />}
          tooltipTitle="Schedule digest"
          onClick={() => setSpeedDialOpen(false)}
        />
        <SpeedDialAction
          icon={<IntegrationInstructionsIcon />}
          tooltipTitle="Open MCP tool"
          onClick={() => setSpeedDialOpen(false)}
        />
      </SpeedDial>

      <Dialog
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Command palette</DialogTitle>
        <DialogContent dividers>
          <List>
            <ListItemButton
              onClick={() => {
                setPaletteOpen(false);
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <AutoAwesomeIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Generate AI summary"
                secondary="Spin up a fresh take on your saved briefing topics"
              />
            </ListItemButton>
            <Divider component="li" variant="inset" flexItem />
            <ListItemButton
              onClick={() => {
                setPaletteOpen(false);
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <MenuBookIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Open knowledge hub"
                secondary="Jump straight to the curated blog guides"
              />
            </ListItemButton>
            <Divider component="li" variant="inset" flexItem />
            <ListItemButton
              onClick={() => {
                setPaletteOpen(false);
                window.open("https://newsapi.org", "_blank", "noopener");
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <OutboundIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Visit NewsAPI"
                secondary="Check quota, explore endpoints, and manage automations"
              />
            </ListItemButton>
            <Divider component="li" variant="inset" flexItem />
            <ListItemButton
              onClick={() => {
                setPaletteOpen(false);
              }}
            >
              <ListItemAvatar>
                <Avatar>
                  <TimelineIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary="Review automation timeline"
                secondary="Inspect MCP runs, status, and debug context"
              />
            </ListItemButton>
          </List>
        </DialogContent>
      </Dialog>

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
