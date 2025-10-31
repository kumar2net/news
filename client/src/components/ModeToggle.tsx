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

  return (
    <Tooltip title={`Theme: ${mode}`}>
      <IconButton onClick={cycleMode} size="small">
        {effectiveMode === "dark" ? (
          <DarkModeIcon />
        ) : effectiveMode === "light" ? (
          <LightModeIcon />
        ) : (
          <AutoModeIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}
