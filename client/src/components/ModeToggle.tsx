import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import AutoModeIcon from "@mui/icons-material/AutoMode";

export default function ModeToggle() {
  const { mode, setMode, systemMode } = useColorScheme();
  const effectiveMode = mode === "system" ? systemMode : mode;
  const cycleMode = () =>
    setMode(mode === "light" ? "dark" : mode === "dark" ? "system" : "light");

  const rotation = mode === "light" ? 0 : mode === "dark" ? 120 : 240;

  return (
    <Tooltip title={`Theme: ${mode}`}>
      <IconButton onClick={cycleMode} size="small">
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            transition: "transform 320ms ease, color 320ms ease",
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {effectiveMode === "dark" ? (
            <DarkModeIcon />
          ) : effectiveMode === "light" ? (
            <LightModeIcon />
          ) : (
            <AutoModeIcon />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  );
}
