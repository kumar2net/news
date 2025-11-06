import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Divider,
  alpha,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import MenuIcon from "@mui/icons-material/Menu";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import ModeToggle from "./components/ModeToggle";

const drawerWidth = 300;

const navConfig = [
  {
    label: "Headlines",
    description: "Origin-country filters",
    icon: <NewspaperIcon />,
    to: "/",
  },
  {
    label: "Search",
    description: "Build custom briefs",
    icon: <TravelExploreIcon />,
    to: "/search",
  },
  {
    label: "Sources",
    description: "Spot bias & translate",
    icon: <RssFeedIcon />,
    to: "/sources",
  },
];

export default function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <DrawerRoot>
      <BrandBadge>
        <SparklesIcon color="primary" />
        <Typography variant="h6" fontWeight={800}>
          Pulseboard
        </Typography>
      </BrandBadge>

      <Divider flexItem />

      <List sx={{ flexGrow: 1 }}>
        {navConfig.map((item) => {
          const active = isActive(item.to);
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <NavButton
                selected={active}
                onClick={() => handleNavigate(item.to)}
              >
                <NavButtonHeader>
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      color: active ? "primary.main" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.label}
                  </Typography>
                </NavButtonHeader>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </NavButton>
            </ListItem>
          );
        })}
      </List>
    </DrawerRoot>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar
        color="transparent"
        position="fixed"
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(16px)",
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.86),
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ display: { md: "none" } }}
            aria-label="open navigation"
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: "0.08em" }}
          >
            kumar2net // news lab
          </Typography>
          <ModeToggle />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="primary navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <MainContent>
        <Toolbar />
        <Container sx={{ py: { xs: 4, md: 6 }, maxWidth: "md" }}>
          <React.Suspense
            fallback={
              <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            }
          >
            <Outlet />
          </React.Suspense>
        </Container>
      </MainContent>
    </Box>
  );
}

const DrawerRoot = styled(Box)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(2),
  gap: theme.spacing(2),
}));

const BrandBadge = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(3),
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
}));

const NavButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  alignItems: "flex-start",
  flexDirection: "column",
  gap: theme.spacing(0.5),
  padding: theme.spacing(1.75, 2.5),
  transition: theme.transitions.create("background-color"),
  "&.Mui-selected": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
  },
  "&.Mui-selected:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.18),
  },
}));

const NavButtonHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

const MainContent = styled("main")(() => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  width: "100%",
}));
